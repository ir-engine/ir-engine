export const cleanString = (str: string) => {
  return str.replaceAll(' ', '-').replace(/[^\w\.\-]/g, '')
}
