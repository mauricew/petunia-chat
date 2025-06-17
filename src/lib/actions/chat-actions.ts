import { createServerFn } from "@tanstack/react-start";
import { db } from "db";
import { getThreadMessages, getUser } from "db/queries";
import { threadMessagesTable, threadsTable } from "db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { generateThreadName } from "lib/actions";
import { chatStream } from "lib/chat";
import { useAuthSession } from "lib/session";

export const createThread = createServerFn({ method: 'POST' })
  .validator((data: { 
    msg: string | undefined, 
    model: string | undefined }
  ) => ({ msg: data.msg, model: data.model }))
  .handler(async ({ data }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return;
    }

    const user = await getUser(session.data.email);
    const [thread] = await db.insert(threadsTable).values({ userId: user!.id }).returning();
    await db.insert(threadMessagesTable).values({
      threadId: thread.id,
      role: 'user',
      content: data.msg!,
      completedAt: new Date(),
      state: 'done',
    });
    await generateThreadName(thread, data.msg!);


    await db.insert(threadMessagesTable).values({
      threadId: thread!.id,
      state: 'generating',
      role: 'assistant',
      content: '',
      model: data.model,
    }).returning()

    return thread;
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
      .map(msg => ({ role: msg.role! as 'assistant' | 'user', content: msg.content! }))

    const [chatMessage] = await db.select().from(threadMessagesTable)
      .where(and(eq(threadMessagesTable.threadId, threadId!), eq(threadMessagesTable.role, 'assistant'), eq(threadMessagesTable.state, 'generating')))
      .orderBy(desc(threadMessagesTable.createdAt))
      .limit(1);
    
    const stream = new ReadableStream({
      async start(controller) {
        const chatResponse = await chatStream(messages, modelName!);

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