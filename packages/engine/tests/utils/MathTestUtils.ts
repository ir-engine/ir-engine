import { Euler, Quaternion, Vector3 } from "three"

export const randomVector3 = (scale = 1) => {
  return new Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
  ).normalize().multiplyScalar(scale)

}
export const randomQuat = () => {  
  return new Quaternion().setFromUnitVectors(
    new Vector3(), 
    randomVector3()
  )
}
export const compareArrays = (arr1, arr2, tolerance) => {
  if(tolerance) {
    arr1.forEach((val, i) => {
      expect(Math.abs(arr2[i] - val)).toBeLessThanOrEqual(tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      expect(val).toBe(arr2[i])
    })
  }
}

export const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}