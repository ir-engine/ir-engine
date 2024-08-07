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

import { Geometry } from '@etherealengine/spatial/src/common/constants/Geometry'
import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'

export enum GeometryTypeEnum {
  'BoxGeometry',
  'SphereGeometry',
  'CylinderGeometry',
  'CapsuleGeometry',
  'PlaneGeometry',
  'CircleGeometry',
  'RingGeometry',
  'TorusGeometry',
  'DodecahedronGeometry',
  'IcosahedronGeometry',
  'OctahedronGeometry',
  'TetrahedronGeometry',
  'TorusKnotGeometry'
}

export const GeometryTypeToClass = {
  [GeometryTypeEnum.BoxGeometry]: BoxGeometry,
  [GeometryTypeEnum.SphereGeometry]: SphereGeometry,
  [GeometryTypeEnum.CylinderGeometry]: CylinderGeometry,
  [GeometryTypeEnum.CapsuleGeometry]: CapsuleGeometry,
  [GeometryTypeEnum.PlaneGeometry]: PlaneGeometry,
  [GeometryTypeEnum.CircleGeometry]: CircleGeometry,
  [GeometryTypeEnum.RingGeometry]: RingGeometry,
  [GeometryTypeEnum.TorusGeometry]: TorusGeometry,
  [GeometryTypeEnum.DodecahedronGeometry]: DodecahedronGeometry,
  [GeometryTypeEnum.IcosahedronGeometry]: IcosahedronGeometry,
  [GeometryTypeEnum.OctahedronGeometry]: OctahedronGeometry,
  [GeometryTypeEnum.TetrahedronGeometry]: TetrahedronGeometry,
  [GeometryTypeEnum.TorusKnotGeometry]: TorusKnotGeometry
}

type GeometryFactory = (data: Record<string, any>) => Geometry

export const GeometryTypeToFactory: Record<GeometryTypeEnum, GeometryFactory> = {
  [GeometryTypeEnum.BoxGeometry]: (data) =>
    new BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments),
  [GeometryTypeEnum.CapsuleGeometry]: (data) =>
    new CapsuleGeometry(data.radius, data.length, data.capSegments, data.radialSegments),
  [GeometryTypeEnum.CircleGeometry]: (data) =>
    new CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength),
  [GeometryTypeEnum.CylinderGeometry]: (data) =>
    new CylinderGeometry(
      data.radiusTop,
      data.radiusBottom,
      data.height,
      data.radialSegments,
      data.heightSegments,
      data.openEnded,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.DodecahedronGeometry]: (data) => new DodecahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.IcosahedronGeometry]: (data) => new IcosahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.OctahedronGeometry]: (data) => new OctahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.PlaneGeometry]: (data) =>
    new PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments),
  [GeometryTypeEnum.RingGeometry]: (data) =>
    new RingGeometry(
      data.innerRadius,
      data.outerRadius,
      data.thetaSegments,
      data.phiSegments,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.SphereGeometry]: (data) =>
    new SphereGeometry(
      data.radius,
      data.widthSegments,
      data.heightSegments,
      data.phiStart,
      data.phiLength,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.TetrahedronGeometry]: (data) => new TetrahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.TorusGeometry]: (data) =>
    new TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc),
  [GeometryTypeEnum.TorusKnotGeometry]: (data) =>
    new TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q)
}
