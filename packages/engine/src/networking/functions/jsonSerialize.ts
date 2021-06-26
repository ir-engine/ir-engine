export const convertObjToBufferSupportedString = (obj: any): string => {
    return JSON.stringify(obj).replaceAll(/\"/g, "\\'");
}

export const convertBufferSupportedStringToObj = (str: string): any => {
    return JSON.parse(str.replaceAll(/\\'/g, '\"'));
}