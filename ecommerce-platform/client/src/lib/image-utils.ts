/**
 * 图片 URL 优化工具
 *
 * 对阿里云 OSS 图片自动追加图片处理参数：
 * - 限制最大宽度
 * - 质量压缩
 * - 转换为 WebP 格式
 */
const OSS_DOMAIN = "aliyuncs.com";

export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number = 1200,
  quality: number = 80
): string {
  if (!url) return "";

  // 只对阿里云 OSS 图片加处理参数
  if (!url.includes(OSS_DOMAIN)) return url;

  // 已经带有处理参数的不再追加
  if (url.includes("x-oss-process")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}x-oss-process=image/resize,w_${width},limit_0/quality,q_${quality}/format,webp`;
}

/**
 * 获取适合缩略图的优化图片 URL
 */
export function getThumbnailUrl(
  url: string | null | undefined,
  width: number = 600
): string {
  return getOptimizedImageUrl(url, width, 80);
}
