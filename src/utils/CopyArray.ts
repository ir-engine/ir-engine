export const copyArray = (src: any[], dest: any[]) => {
  const srcArray = src
  const destArray = dest
  destArray.length = 0
  for (let i = 0; i < srcArray.length; i++) destArray.push(srcArray[i])
  return destArray
}

export default copyArray
