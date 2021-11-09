export default function stringifyArray(array: any[]) {
  switch (array.length) {
    case 1:
      return array[0]
    case 2:
      return array[0] + ',' + array[1]
    case 3:
      return array[0] + ',' + array[1] + ',' + array[2]
    case 4:
      return array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3]
    default:
      return array.join(',')
  }
}
