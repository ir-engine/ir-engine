export const assert = (check: boolean, text?: string) => {
  if (!check)
    error(text)
}

export const error = (text?: string) =>
  console.error(text)

export const timeout = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time))
