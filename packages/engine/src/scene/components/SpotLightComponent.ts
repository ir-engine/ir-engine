import { Color, SpotLight, Vector2, SpotLightHelper } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'
import { addIsHelperFlag } from '../functions/addIsHelperFlag'

export type SpotLightDataProps = {
  color?: Color,
  intensity?: number,
  castShadow?: boolean,
  shadowMapResolution?: number[] | Vector2,
  shadowBias: number,
  shadowRadius: number,
  range: number,
  innerConeAngle: number,
  outerConeAngle: number,
}

export class SpotLightData implements ComponentData {
  static legacyComponentName = ComponentNames.SPOT_LIGHT

  constructor(obj3d: SpotLight, props?: SpotLightDataProps) {
    this.obj3d = obj3d

    this.helper = new SpotLightHelper(this.obj3d)
    this.helper.visible = false
    this.obj3d.add(this.helper)

    addIsHelperFlag(this.helper)

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

      if (props.range != null) {
        this.range = props.range
      }

      if (props.innerConeAngle != null) {
        this.innerConeAngle = props.innerConeAngle
      }

      if (props.outerConeAngle != null) {
        this.outerConeAngle = props.outerConeAngle
      }
    }
  }

  obj3d: SpotLight
  helper: SpotLightHelper

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

  get range() {
    return this.obj3d.distance
  }

  set range(range: number) {
    this.obj3d.distance = range
  }

  get outerConeAngle() {
    return this.obj3d.angle
  }

  set outerConeAngle(angle: number) {
    this.obj3d.angle = angle
  }

  get innerConeAngle() {
    return this.obj3d.penumbra
  }

  set innerConeAngle(penumbra: number) {
    this.obj3d.penumbra = Math.max(Math.min(penumbra, 1), 0)
  }

  serialize(): SpotLightDataProps {
    return {
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow,
      shadowMapResolution: this.shadowMapResolution.toArray(),
      shadowBias: this.shadowBias,
      shadowRadius: this.shadowRadius,
      range: this.range,
      innerConeAngle: this.innerConeAngle,
      outerConeAngle: this.outerConeAngle
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const SpotLightComponent = createMappedComponent<SpotLightData>('SpotLightComponent')
