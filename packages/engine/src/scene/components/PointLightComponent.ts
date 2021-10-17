import { Color, PointLight, Vector2, PointLightHelper, Mesh, IcosahedronBufferGeometry, MeshBasicMaterial } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'

export type PointLightDataProps = {
  color?: Color,
  intensity?: number,
  castShadow?: boolean,
  shadowMapResolution?: number[] | Vector2,
  shadowBias: number,
  shadowRadius: number,
  range: number
}

export class PointLightData implements ComponentData {
  static legacyComponentName = ComponentNames.POINT_LIGHT

  constructor(obj3d: PointLight, props?: PointLightDataProps) {
    this.obj3d = obj3d

    this.helper = new PointLightHelper(this.obj3d)
    this.helper.visible = false
    this.obj3d.add(this.helper)

    this.lightDistanceHelper = new Mesh(
      new IcosahedronBufferGeometry(1, 2),
      new MeshBasicMaterial({
        fog: false,
        wireframe: true,
        opacity: 0.1,
        transparent: true
      })
    )
    this.lightDistanceHelper.layers.set(1)
    this.helper.add(this.lightDistanceHelper)

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
    }
  }

  obj3d: PointLight
  helper: PointLightHelper
  lightDistanceHelper: Mesh

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

    if (this.lightDistanceHelper) {
      this.lightDistanceHelper.scale.set(range, range, range)
    }
  }

  serialize(): PointLightDataProps {
    return {
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow,
      shadowMapResolution: this.shadowMapResolution.toArray(),
      shadowBias: this.shadowBias,
      shadowRadius: this.shadowRadius,
      range: this.range
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const PointLightComponent = createMappedComponent<PointLightData>('PointLightComponent')
