import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createServerFn } from "@tanstack/react-start";

import { getThreadMessage } from 'db/queries';

const bucketName = 'petunia-uploads';
const regionName = 'us-east-1';
const expirationDuration = 300;

export const generatePresignedUrl = createServerFn({ method: 'POST' })
  .validator((data: { threadMessageId: number, method: 'get' | 'put' }) => data)
  .handler(async ({ data }) => {
    const threadMessage = await getThreadMessage(data.threadMessageId);
    if (!threadMessage?.attachmentFilename) {
      throw new Error('should not be here');
    }

    const s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_CLIENT_ID!,
        secretAccessKey: process.env.S3_CLIENT_SECRET!,
      },
      endpoint: `http://${process.env.S3_HOST!}:${process.env.S3_PORT!}`,
      forcePathStyle: true,
      region: regionName,
    });

    const cmd = data.method === 'put' 
      ? new PutObjectCommand({ Bucket: bucketName, Key: threadMessage.attachmentFilename })
      : new GetObjectCommand({ Bucket: bucketName, Key: threadMessage.attachmentFilename });
    const presignedUrl = await getSignedUrl(s3Client, cmd, { expiresIn: expirationDuration });

    return { url: presignedUrl };
  });
