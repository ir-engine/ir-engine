/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
