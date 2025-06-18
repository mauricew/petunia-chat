import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";

import { db } from "db";
import { getThreadMessages, getUser } from "db/queries";
import { threadMessagesTable, threadsTable } from "db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { generateThreadName } from "lib/actions";
import { chatStream } from "lib/chat";
import { useAuthSession } from "lib/session";
import { generatePresignedUrl } from "./upload-actions";

export const createThread = createServerFn({ method: 'POST' })
  .validator((data: { 
    msg: string | undefined,
    attachmentMime: string | undefined;
    model: string | undefined 
  }
  ) => ({ msg: data.msg, model: data.model, attachmentMime: data.attachmentMime }))
  .handler(async ({ data }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);

    const user = await getUser(session.data.email);
    const [thread] = await db.insert(threadsTable).values({ userId: user!.id }).returning();
    const firstUserMessage = await db.insert(threadMessagesTable).values({
      threadId: thread.id,
      role: 'user',
      content: data.msg!,
      attachmentFilename: data.attachmentMime ? randomUUID() : null,
      attachmentMime: data.attachmentMime,
      completedAt: new Date(),
      state: 'done',
    }).returning();;
    await generateThreadName(thread, data.msg!);


    await db.insert(threadMessagesTable).values({
      threadId: thread!.id,
      state: 'generating',
      role: 'assistant',
      content: '',
      model: data.model,
    }).returning()

    return { thread, firstUserMessage: firstUserMessage[0] };
  });

export const appendThread = createServerFn({ method: 'POST' })
  .validator((data: {
    threadId: number | undefined;
    msg: string | undefined;
    model: string | undefined
  }) => data)
  .handler(async ({ data }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return;
    }

    await db.insert(threadMessagesTable).values({
      threadId: data.threadId!,
      role: 'user',
      content: data.msg!,
      completedAt: new Date(),
      state: 'done',
      model: data.model!
    });

    await db.insert(threadMessagesTable).values({
      threadId: data.threadId!,
      state: 'generating',
      role: 'assistant',
      content: '',
      model: data.model,
    }).returning();
  });

export const regenerateMessage = createServerFn({ method: 'POST' })
  .validator((data: { threadMessageId: number | undefined }) => data)
  .handler(async ({ data: { threadMessageId }}) => {
    const messageSelect = await db.select().from(threadMessagesTable)
      .where(eq(threadMessagesTable.id, threadMessageId!));

    if (messageSelect.length === 0) {
      throw new Error('message ID not found');
    }

    const [originalMessage] = messageSelect;

    const newMessage: typeof threadMessagesTable.$inferInsert = {
      threadId: originalMessage.threadId,
      role: 'assistant',
      model: originalMessage.model,
      state: 'generating',
      content: '',
    }

    const insertedNewMessage = await db.insert(threadMessagesTable)
      .values(newMessage)
      .returning();

    await db.update(threadMessagesTable)
      .set({ regeneratedMessageId: insertedNewMessage[0].id})
      .where(eq(threadMessagesTable.id, originalMessage.id))
    
    return insertedNewMessage[0];
  });

export const startChatStream = createServerFn({ method: 'POST', response: 'raw' })
  .validator((data: { threadId: number | undefined; modelName: string | undefined }) => data)
  .handler(async ({ data: { threadId, modelName }, signal }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return new Response('', {
        headers: {
          'Content-Type': 'text/plain'
        },
        status: 401,
      });
    }

    const dbMessages = await getThreadMessages(threadId!);
    const messages = dbMessages
      .filter(msg => msg.state === 'done')
      .map(async msg => {
        let content;
        if (msg.attachmentFilename) {
          const { url } = await generatePresignedUrl({ data: { threadMessageId: msg.id, method: 'get' } });
          const fileRepsonse = await fetch(url);
          const arrayBuffer = await fileRepsonse.arrayBuffer();
          const b64 = Buffer.from(arrayBuffer).toString('base64');
          content = [
            { type: 'text', text: msg.content! },
            { type: 'image_url', image_url: `data:${msg.attachmentMime!};base64,${b64}` }
          ];
        } else {
          content = msg.content!
        }

        return  { 
          role: msg.role! as 'assistant' | 'user', 
          content,
        }
      })

    const awaitedMessages  = await Promise.all(messages);

    const [chatMessage] = await db.select().from(threadMessagesTable)
      .where(and(eq(threadMessagesTable.threadId, threadId!), eq(threadMessagesTable.role, 'assistant'), eq(threadMessagesTable.state, 'generating')))
      .orderBy(desc(threadMessagesTable.createdAt))
      .limit(1);
    
    const stream = new ReadableStream({
      async start(controller) {
        let chatResponse;
        try {
          chatResponse = await chatStream(awaitedMessages, modelName!);
        } catch (err) {
          return;
        }

        for await (const part of chatResponse) {
          const [choice] = part.choices;
          if (choice.finish_reason) {
            await db.update(threadMessagesTable)
              .set({ state: 'done', finishReason: choice.finish_reason, completedAt: new Date() })
              .where(eq(threadMessagesTable.id, chatMessage.id));

            controller.close();
            return;
          }

          const delta = choice.delta.content;

          if (delta) {
            controller.enqueue(new TextEncoder().encode(delta || ''));
            await db.update(threadMessagesTable)
              .set({
                content: sql`${threadMessagesTable.content} || ${delta}`
              })
              .where(eq(threadMessagesTable.id, chatMessage.id));
          }
        }

        signal.addEventListener('abort', () => {
          db.update(threadMessagesTable)
            .set({ state: 'halted', completedAt: new Date() })
            .where(eq(threadMessagesTable.id, chatMessage.id));
          controller.close()
        })
      },
    })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})