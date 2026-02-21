import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const useLocal = !process.env.S3_BUCKET;
const client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY ? {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  } : undefined,
  forcePathStyle: true
});

export async function signedUpload(key: string, contentType: string) {
  if (useLocal) return { url: `/uploads/local/${key}`, fields: {} };
  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: contentType });
  return { url: await getSignedUrl(client, command, { expiresIn: 3600 }) };
}

export async function signedDownload(key: string) {
  if (useLocal) return `/uploads/local/${key}`;
  return getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }), { expiresIn: 3600 });
}
