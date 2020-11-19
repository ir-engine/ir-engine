export function hashResourceString(str: string): string {
  let hash = 0;
  let i = 0;
  const len = str.length;
  while (i < len) {
    hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
  }
  // Return the hash plus part of the file name
  return `${hash}${str.substr(Math.max(str.length - 7, 0))}`;
}