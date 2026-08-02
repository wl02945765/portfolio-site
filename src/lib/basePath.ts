const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Media paths in content/*.json are stored root-relative (e.g. "/media/photos/x.jpg"),
 * but the site can be deployed under a GitHub Pages sub-path (e.g. "/portfolio-site").
 * next/image and next/link handle this automatically; plain <img>/<video> src attributes
 * and next/image calls with `unoptimized` do not, so route them through this helper.
 */
export function withBasePath(path: string): string {
  if (!path) return path;
  return `${BASE_PATH}${path}`;
}
