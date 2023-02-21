//from https://stackoverflow.com/questions/16824650/three-js-how-to-flip-normals-after-negative-scale/54496265#54496265

export function flipBufferGeometryNormals(geometry) {
  const tempXYZ = [0, 0, 0]

  // flip normals
  if (geometry.attributes.normal) {
    for (let i = 0; i < geometry.attributes.normal.array.length / 9; i++) {
      // cache a coordinates
      tempXYZ[0] = geometry.attributes.normal.array[i * 9]
      tempXYZ[1] = geometry.attributes.normal.array[i * 9 + 1]
      tempXYZ[2] = geometry.attributes.normal.array[i * 9 + 2]

      // overwrite a with c
      geometry.attributes.normal.array[i * 9] = geometry.attributes.normal.array[i * 9 + 6]
      geometry.attributes.normal.array[i * 9 + 1] = geometry.attributes.normal.array[i * 9 + 7]
      geometry.attributes.normal.array[i * 9 + 2] = geometry.attributes.normal.array[i * 9 + 8]

      // overwrite c with stored a values
      geometry.attributes.normal.array[i * 9 + 6] = tempXYZ[0]
      geometry.attributes.normal.array[i * 9 + 7] = tempXYZ[1]
      geometry.attributes.normal.array[i * 9 + 8] = tempXYZ[2]
    }
    geometry.attributes.normal.needsUpdate = true
  }

  if (geometry.attributes.position) {
    // change face winding order
    for (let i = 0; i < geometry.attributes.position.array.length / 9; i++) {
      // cache a coordinates
      tempXYZ[0] = geometry.attributes.position.array[i * 9]
      tempXYZ[1] = geometry.attributes.position.array[i * 9 + 1]
      tempXYZ[2] = geometry.attributes.position.array[i * 9 + 2]

      // overwrite a with c
      geometry.attributes.position.array[i * 9] = geometry.attributes.position.array[i * 9 + 6]
      geometry.attributes.position.array[i * 9 + 1] = geometry.attributes.position.array[i * 9 + 7]
      geometry.attributes.position.array[i * 9 + 2] = geometry.attributes.position.array[i * 9 + 8]

      // overwrite c with stored a values
      geometry.attributes.position.array[i * 9 + 6] = tempXYZ[0]
      geometry.attributes.position.array[i * 9 + 7] = tempXYZ[1]
      geometry.attributes.position.array[i * 9 + 8] = tempXYZ[2]
    }
    geometry.attributes.position.needsUpdate = true
  }

  // flip UV coordinates
  if (geometry.attributes.uv) {
    for (let i = 0; i < geometry.attributes.uv.array.length / 6; i++) {
      // cache a coordinates
      tempXYZ[0] = geometry.attributes.uv.array[i * 6]
      tempXYZ[1] = geometry.attributes.uv.array[i * 6 + 1]

      // overwrite a with c
      geometry.attributes.uv.array[i * 6] = geometry.attributes.uv.array[i * 6 + 4]
      geometry.attributes.uv.array[i * 6 + 1] = geometry.attributes.uv.array[i * 6 + 5]

      // overwrite c with stored a values
      geometry.attributes.uv.array[i * 6 + 4] = tempXYZ[0]
      geometry.attributes.uv.array[i * 6 + 5] = tempXYZ[1]
    }
    geometry.attributes.uv.needsUpdate = true
  }
}
