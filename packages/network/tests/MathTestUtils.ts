export const roundNumberToPlaces = (number: number, places = 2) => {
  return Math.pow(10, -places) * Math.round(number * Math.pow(10, places))
}
