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

import { BufferGeometry, ColorRepresentation, Material, Matrix3, Matrix4, Quaternion, Vector3 } from 'three'
import { matches } from 'ts-matches'

const matchesVec3Shape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number
})

const matchesQuatShape = matches.some(
  matches.shape({
    _x: matches.number,
    _y: matches.number,
    _z: matches.number,
    _w: matches.number
  }),
  matches.shape({
    x: matches.number,
    y: matches.number,
    z: matches.number,
    w: matches.number
  })
)

const matchesMat4 = matches.shape({
  elements: matches.tuple(
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number
  )
})

const matchesMat3 = matches.shape({
  elements: matches.tuple(
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number
  )
})

const matchesColorShape = matches.some(
  matches.string,
  matches.number,
  matches.shape({
    r: matches.number,
    g: matches.number,
    b: matches.number
  }),
  matches.shape({
    h: matches.number,
    s: matches.number,
    l: matches.number
  })
)

const matchesGeometryShape = matches.shape({
  uuid: matches.string,
  isBufferGeometry: matches.literal(true)
})

const matchesMaterialShape = matches.shape({
  uuid: matches.string,
  isMaterial: matches.literal(true)
})

const matchesMeshMaterialShape = matches.some(matchesMaterialShape, matches.arrayOf(matchesMaterialShape))

const matchesVector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
const matchesQuaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))
const matchesMatrix4 = matches.guard((m): m is Matrix4 => matchesMat4.test(m))
const matchesMatrix3 = matches.guard((m): m is Matrix3 => matchesMat3.test(m))
const matchesColor = matches.guard((c): c is ColorRepresentation => matchesColorShape.test(c))
const matchesGeometry = matches.guard((b): b is BufferGeometry => matchesGeometryShape.test(b))
const matchesMaterial = matches.guard((m): m is Material => matchesMaterialShape.test(m))
const matchesMeshMaterial = matches.guard((m): m is Material | Material[] => matchesMeshMaterialShape.test(m))

export {
  matchesColor,
  matchesGeometry,
  matchesMaterial,
  matchesMatrix3,
  matchesMatrix4,
  matchesMeshMaterial,
  matchesQuaternion,
  matchesVector3
}
