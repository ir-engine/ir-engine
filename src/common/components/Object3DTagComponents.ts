// Tag components for every Object3D in the three.js core library

import { TagComponent } from "../../ecs/TagComponent"

// audio
export class AudioTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class AudioListenerTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class PositionalAudioTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

// cameras
export class ArrayCameraTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class CameraTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class CubeCameraTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class OrthographicCameraTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class PerspectiveCameraTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

// extras/objects
export class ImmediateRenderObjectTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

// helpers

// Due to inconsistency in implementing consistent identifying properties like "type" on helpers, we've
// chosen to exclude helper tag components.

// lights
export class AmbientLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class AmbientLightProbeTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class DirectionalLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class HemisphereLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class HemisphereLightProbeTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LightProbeTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class PointLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class RectAreaLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class SpotLightTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

// objects
export class BoneTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class GroupTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class InstancedMeshTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LODTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LineTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LineLoopTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class LineSegmentsTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class MeshTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}
export class PointsTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class SkinnedMeshTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

export class SpriteTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}

// scenes
export class SceneTagComponent extends Component<any> {
  static isObject3DTagComponent = true
}
