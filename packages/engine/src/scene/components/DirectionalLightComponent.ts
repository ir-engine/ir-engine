import { Color, DirectionalLight, Vector2, CameraHelper } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'

export type DirectionalLightDataProps = {
  color?: Color,
  intensity?: number,
  castShadow?: boolean,
  shadowMapResolution?: number[] | Vector2,
  shadowBias: number,
  shadowRadius: number,
  cameraFar: number,
  showCameraHelper: boolean
}

export class DirectionalLightData implements ComponentData {
  static legacyComponentName = ComponentNames.DIRECTIONAL_LIGHT

  constructor(obj3d: DirectionalLight, props?: DirectionalLightDataProps) {
    this.obj3d = obj3d

    this.cameraHelper = new CameraHelper(this.obj3d.shadow.camera)
    this.cameraHelper.visible = false
    this.obj3d.add(this.cameraHelper)

    if (props) {
      if (props.color) {
        this.color = typeof props.color === 'string' ? new Color(props.color) : props.color
      }

      if (props.intensity != null) {
        this.intensity = props.intensity
      }

      if (props.castShadow != null) {
        this.castShadow = props.castShadow
      }

      if (props.shadowMapResolution) {
        if (Array.isArray(props.shadowMapResolution)) {
          this.shadowMapResolution = new Vector2(props.shadowMapResolution[0], props.shadowMapResolution[1])
        } else {
          this.shadowMapResolution = this.shadowMapResolution
        }
      }

      if (props.shadowBias != null) {
        this.shadowBias = props.shadowBias
      }

      if (props.shadowRadius != null) {
        this.shadowRadius = props.shadowRadius
      }

      if (props.cameraFar != null) {
        this.cameraFar = props.cameraFar
      }

      if (props.showCameraHelper != null) {
        this.showCameraHelper = props.showCameraHelper
      }
    }
  }

  obj3d: DirectionalLight
  cameraHelper: CameraHelper

  get color() {
    return this.obj3d.color
  }

  set color(color: Color) {
    this.obj3d.color = color
  }

  get intensity() {
    return this.obj3d.intensity
  }

  set intensity(intensity: number) {
    this.obj3d.intensity = intensity
  }

  get castShadow() {
    return this.obj3d.castShadow
  }

  set castShadow(castShadow: boolean) {
    this.obj3d.castShadow = castShadow
  }

  get shadowMapResolution() {
    return this.obj3d.shadow.mapSize
  }

  set shadowMapResolution(shadowMapResolution: Vector2) {
    this.obj3d.shadow.mapSize = shadowMapResolution
  }

  get shadowBias() {
    return this.obj3d.shadow.bias
  }

  set shadowBias(bias: number) {
    this.obj3d.shadow.bias = bias
  }

  get shadowRadius() {
    return this.obj3d.shadow.radius
  }

  set shadowRadius(radius: number) {
    this.obj3d.shadow.radius = radius
  }

  get cameraFar() {
    return this.obj3d.shadow.camera.far
  }

  set cameraFar(far: number) {
    this.obj3d.shadow.camera.far = far
  }

  get showCameraHelper() {
    return this.cameraHelper.visible
  }

  set showCameraHelper(visible: boolean) {
    this.cameraHelper.visible = visible
  }

  serialize(): DirectionalLightDataProps {
    return {
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow,
      shadowMapResolution: this.shadowMapResolution.toArray(),
      shadowBias: this.shadowBias,
      shadowRadius: this.shadowRadius,
      cameraFar: this.cameraFar,
      showCameraHelper: this.showCameraHelper
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const DirectionalLightComponent = createMappedComponent<DirectionalLightData>('DirectionalLightComponent')
