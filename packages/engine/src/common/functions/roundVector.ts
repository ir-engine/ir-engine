import { Vector3 } from "three";

export const roundNumberToPlaces = (number: number, places: number) => {
  return (Math.pow(10, -places)) * Math.round(number * Math.pow(10, places))
}

const vec3 = new Vector3();
export const roundVectorToPlaces = (vector: Vector3, places: number) => {
  return vec3.set(roundNumberToPlaces(vector.x, places), roundNumberToPlaces(vector.y, places), roundNumberToPlaces(vector.z, places));
}