export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '/contentoire';
}
