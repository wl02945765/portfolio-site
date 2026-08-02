// Category names are often non-ASCII (e.g. "人像"). Next 16's static export
// mishandles non-ASCII dynamic route segments — the build reports success but
// serves an error shell instead of the real page. Routing on a base64url-encoded
// slug instead sidesteps that entirely. Uses TextEncoder/TextDecoder + btoa/atob
// (not node:Buffer) so the same code works in both server and client components.

export function encodeCategorySlug(category: string): string {
  const bytes = new TextEncoder().encode(category);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCategorySlug(slug: string): string {
  const binary = atob(slug.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
