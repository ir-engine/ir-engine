/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Geometry } from '@ir-engine/spatial/src/common/constants/Geometry'
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

export const GeometryTypeParamsEnum = {
  [GeometryTypeEnum.BoxGeometry]: {
    width: { default: 1, min: 1 },
    height: { default: 1, min: 1 },
    depth: { default: 1, min: 1 }
  },

  [GeometryTypeEnum.SphereGeometry]: {
    radius: { default: 1, min: 1 },
    widthSegments: { default: 32, min: 3 },
    heightSegments: { default: 16, min: 2 },
    phiStart: { default: 0, min: 0 },
    phiLength: { default: Math.PI * 2, min: 0 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI, min: 0 }
  },

  [GeometryTypeEnum.CylinderGeometry]: {
    radiusTop: { default: 1, min: 0 },
    radiusBottom: { default: 1, min: 0 },
    height: { default: 1, min: 1 },
    radialSegments: { default: 8, min: 3 },
    heightSegments: { default: 1, min: 1 },
    openEnded: { default: false },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryTypeEnum.CapsuleGeometry]: {
    radius: { default: 1, min: 1 },
    length: { default: 1, min: 1 },
    capSegments: { default: 4, min: 1 },
    radialSegments: { default: 8, min: 3 }
  },

  [GeometryTypeEnum.PlaneGeometry]: {
    width: { default: 1, min: 1 },
    height: { default: 1, min: 1 }
  },

  [GeometryTypeEnum.CircleGeometry]: {
    radius: { default: 1, min: 1 },
    segments: { default: 32, min: 0 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryTypeEnum.RingGeometry]: {
    innerRadius: { default: 0.5, min: 1 },
    outerRadius: { default: 1, min: 1 },
    thetaSegments: { default: 32, min: 1 },
    phiSegments: { default: 1, min: 1 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryTypeEnum.TorusGeometry]: {
    radius: { default: 1, min: 1 },
    tube: { default: 0.4, min: 0.1 },
    radialSegments: { default: 8, min: 2 },
    tubularSegments: { default: 6, min: 3 },
    arc: { default: Math.PI * 2, min: 0.1 }
  },

  [GeometryTypeEnum.DodecahedronGeometry]: {
    radius: { default: 1, min: 1 },
    detail: { default: 0, min: 0 }
  },

  [GeometryTypeEnum.IcosahedronGeometry]: {
    radius: { default: 1, min: 1 },
    detail: { default: 0, min: 0 }
  },

  [GeometryTypeEnum.OctahedronGeometry]: {
    radius: { default: 1, min: 1 },
    detail: { default: 0, min: 0 }
  },

  [GeometryTypeEnum.TetrahedronGeometry]: {
    radius: { default: 1, min: 1 },
    detail: { default: 0, min: 0 }
  },

  [GeometryTypeEnum.TorusKnotGeometry]: {
    radius: { default: 1, min: 1 },
    tube: { default: 0.4, min: 0.1 },
    tubularSegments: { default: 64, min: 3 },
    radialSegments: { default: 8, min: 3 },
    p: { default: 2, min: 1 },
    q: { default: 3, min: 1 }
  }
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
