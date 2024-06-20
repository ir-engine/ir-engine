export const cleanURL = (url: string) => {
  const newURL = new URL(url)
  return newURL.origin + newURL.pathname
}
