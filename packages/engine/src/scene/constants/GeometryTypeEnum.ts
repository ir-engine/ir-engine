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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
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

export const GeometryType = {
  BoxGeometry: 'BoxGeometry' as const,
  SphereGeometry: 'SphereGeometry' as const,
  CylinderGeometry: 'CylinderGeometry' as const,
  CapsuleGeometry: 'CapsuleGeometry' as const,
  PlaneGeometry: 'PlaneGeometry' as const,
  CircleGeometry: 'CircleGeometry' as const,
  RingGeometry: 'RingGeometry' as const,
  TorusGeometry: 'TorusGeometry' as const,
  DodecahedronGeometry: 'DodecahedronGeometry' as const,
  IcosahedronGeometry: 'IcosahedronGeometry' as const,
  OctahedronGeometry: 'OctahedronGeometry' as const,
  TetrahedronGeometry: 'TetrahedronGeometry' as const,
  TorusKnotGeometry: 'TorusKnotGeometry' as const
}

export type GeometryType = (typeof GeometryType)[keyof typeof GeometryType]

export const GeometryTypeParamsEnum = {
  [GeometryType.BoxGeometry]: {
    width: { default: 1, min: 1 },
    height: { default: 1, min: 1 },
    depth: { default: 1, min: 1 }
  },

  [GeometryType.SphereGeometry]: {
    radius: { default: 1, min: 0.01 },
    widthSegments: { default: 32, min: 3 },
    heightSegments: { default: 16, min: 2 },
    phiStart: { default: 0, min: 0 },
    phiLength: { default: Math.PI * 2, min: 0 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI, min: 0 }
  },

  [GeometryType.CylinderGeometry]: {
    radiusTop: { default: 1, min: 0.01 },
    radiusBottom: { default: 1, min: 0.01 },
    height: { default: 1, min: 1 },
    radialSegments: { default: 8, min: 3 },
    heightSegments: { default: 1, min: 1 },
    openEnded: { default: false },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryType.CapsuleGeometry]: {
    radius: { default: 1, min: 0.01 },
    length: { default: 1, min: 1 },
    capSegments: { default: 4, min: 1 },
    radialSegments: { default: 8, min: 3 }
  },

  [GeometryType.PlaneGeometry]: {
    width: { default: 1, min: 1 },
    height: { default: 1, min: 1 }
  },

  [GeometryType.CircleGeometry]: {
    radius: { default: 1, min: 0.01 },
    segments: { default: 32, min: 0 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryType.RingGeometry]: {
    innerRadius: { default: 0.5, min: 0.01 },
    outerRadius: { default: 1, min: 0.01 },
    thetaSegments: { default: 32, min: 1 },
    phiSegments: { default: 1, min: 1 },
    thetaStart: { default: 0, min: 0 },
    thetaLength: { default: Math.PI * 2, min: 0 }
  },

  [GeometryType.TorusGeometry]: {
    radius: { default: 1, min: 0.01 },
    tube: { default: 0.4, min: 0.1 },
    radialSegments: { default: 8, min: 2 },
    tubularSegments: { default: 6, min: 3 },
    arc: { default: Math.PI * 2, min: 0.1 }
  },

  [GeometryType.DodecahedronGeometry]: {
    radius: { default: 1, min: 0.01 },
    detail: { default: 0, min: 0 }
  },

  [GeometryType.IcosahedronGeometry]: {
    radius: { default: 1, min: 0.01 },
    detail: { default: 0, min: 0 }
  },

  [GeometryType.OctahedronGeometry]: {
    radius: { default: 1, min: 0.01 },
    detail: { default: 0, min: 0 }
  },

  [GeometryType.TetrahedronGeometry]: {
    radius: { default: 1, min: 0.01 },
    detail: { default: 0, min: 0 }
  },

  [GeometryType.TorusKnotGeometry]: {
    radius: { default: 1, min: 0.01 },
    tube: { default: 0.4, min: 0.1 },
    tubularSegments: { default: 64, min: 3 },
    radialSegments: { default: 8, min: 3 },
    p: { default: 2, min: 1 },
    q: { default: 3, min: 1 }
  }
}

export const GeometryTypeToClass = {
  [GeometryType.BoxGeometry]: BoxGeometry,
  [GeometryType.SphereGeometry]: SphereGeometry,
  [GeometryType.CylinderGeometry]: CylinderGeometry,
  [GeometryType.CapsuleGeometry]: CapsuleGeometry,
  [GeometryType.PlaneGeometry]: PlaneGeometry,
  [GeometryType.CircleGeometry]: CircleGeometry,
  [GeometryType.RingGeometry]: RingGeometry,
  [GeometryType.TorusGeometry]: TorusGeometry,
  [GeometryType.DodecahedronGeometry]: DodecahedronGeometry,
  [GeometryType.IcosahedronGeometry]: IcosahedronGeometry,
  [GeometryType.OctahedronGeometry]: OctahedronGeometry,
  [GeometryType.TetrahedronGeometry]: TetrahedronGeometry,
  [GeometryType.TorusKnotGeometry]: TorusKnotGeometry
}

type GeometryFactory = (data: Record<string, any>) => Geometry

export const GeometryTypeToFactory: Record<GeometryType, GeometryFactory> = {
  [GeometryType.BoxGeometry]: (data) =>
    new BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments),
  [GeometryType.CapsuleGeometry]: (data) =>
    new CapsuleGeometry(data.radius, data.length, data.capSegments, data.radialSegments),
  [GeometryType.CircleGeometry]: (data) =>
    new CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength),
  [GeometryType.CylinderGeometry]: (data) =>
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
  [GeometryType.DodecahedronGeometry]: (data) => new DodecahedronGeometry(data.radius, data.detail),
  [GeometryType.IcosahedronGeometry]: (data) => new IcosahedronGeometry(data.radius, data.detail),
  [GeometryType.OctahedronGeometry]: (data) => new OctahedronGeometry(data.radius, data.detail),
  [GeometryType.PlaneGeometry]: (data) =>
    new PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments),
  [GeometryType.RingGeometry]: (data) =>
    new RingGeometry(
      data.innerRadius,
      data.outerRadius,
      data.thetaSegments,
      data.phiSegments,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryType.SphereGeometry]: (data) =>
    new SphereGeometry(
      data.radius,
      data.widthSegments,
      data.heightSegments,
      data.phiStart,
      data.phiLength,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryType.TetrahedronGeometry]: (data) => new TetrahedronGeometry(data.radius, data.detail),
  [GeometryType.TorusGeometry]: (data) =>
    new TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc),
  [GeometryType.TorusKnotGeometry]: (data) =>
    new TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q)
}
