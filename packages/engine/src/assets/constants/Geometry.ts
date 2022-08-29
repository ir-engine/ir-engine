import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  EdgesGeometry,
  IcosahedronGeometry,
  LatheGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  PolyhedronGeometry,
  RingGeometry,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  TubeGeometry
} from 'three'

export type Geometry =
  | BoxGeometry
  | ConeGeometry
  | BufferGeometry
  | PlaneGeometry
  | RingGeometry
  | TubeGeometry
  | EdgesGeometry
  | ShapeGeometry
  | LatheGeometry
  | TorusGeometry
  | CircleGeometry
  | SphereGeometry
  | IcosahedronGeometry
  | PolyhedronGeometry
  | CapsuleGeometry
  | CylinderGeometry
  | TorusKnotGeometry
  | OctahedronGeometry
