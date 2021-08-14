export const delay = (delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
}
