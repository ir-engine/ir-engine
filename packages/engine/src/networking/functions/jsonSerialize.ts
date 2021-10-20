export const convertObjToBufferSupportedString = (obj: any): string => {
  return JSON.stringify(obj).replace(/\"/g, "\\'")
}

export const convertBufferSupportedStringToObj = (str: string): any => {
  return JSON.parse(str.replace(/\\'/g, '"'))
}
