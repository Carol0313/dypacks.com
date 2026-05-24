/**
 * 阿里云 OSS 上传模块
 *
 * 阿里云 OSS 兼容 AWS S3 API，复用项目已有的 @aws-sdk/client-s3
 *
 * 需要在 .env 中配置：
 *   OSS_BUCKET=your-bucket-name
 *   OSS_REGION=oss-cn-shanghai
 *   OSS_ENDPOINT=https://oss-cn-shanghai.aliyuncs.com
 *   OSS_ACCESS_KEY_ID=your-access-key
 *   OSS_ACCESS_KEY_SECRET=your-secret-key
 *   OSS_PUBLIC_URL=https://your-bucket.oss-cn-shanghai.aliyuncs.com  (或 CDN 加速域名)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.OSS_BUCKET;
const endpoint = process.env.OSS_ENDPOINT;
const region = process.env.OSS_REGION || "oss-cn-shanghai";
const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
const secretAccessKey = process.env.OSS_ACCESS_KEY_SECRET;
const publicUrl = process.env.OSS_PUBLIC_URL;

export const ossEnabled = !!(bucket && endpoint && accessKeyId && secretAccessKey && publicUrl);

export const ossClient = ossEnabled
  ? new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    })
  : null;

/**
 * 上传 Buffer 到阿里云 OSS
 * @param key 对象路径，如 products/xxx.jpg
 * @param buffer 文件 Buffer
 * @param contentType MIME 类型
 * @returns 可公开访问的 URL
 */
export async function ossPut(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!ossClient || !bucket) {
    throw new Error("OSS not configured. Check .env OSS_* variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await ossClient.send(command);

  // 返回公开访问 URL（确保 Bucket 或 Object ACL 允许公开读取）
  const base = publicUrl!.replace(/\/$/, "");
  const safeKey = key.replace(/^\//, "");
  return `${base}/${safeKey}`;
}
