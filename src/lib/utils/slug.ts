/**
 * Converts a display string into a URL-friendly slug.
 * Example: "Nike Running Shoes!" -> "nike-running-shoes"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
