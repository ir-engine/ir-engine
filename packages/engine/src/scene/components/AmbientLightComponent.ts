import { Color, AmbientLight } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent, getCountOfComponentType } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'

export type AmbientLightDataProps = {
  color?: Color,
  intensity?: number
}

export class AmbientLightData implements ComponentData {
  static legacyComponentName = ComponentNames.AMBIENT_LIGHT

  constructor(obj3d: AmbientLight, props?: AmbientLightDataProps) {
    this.obj3d = obj3d

    if (props) {
      if (props.color) {
        this.color = typeof props.color === 'string' ? new Color(props.color) : props.color
      }

      if (props.intensity != null) {
        this.intensity = props.intensity
      }
    }
  }

  obj3d: AmbientLight

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

  serialize(): AmbientLightDataProps {
    return {
      color: this.color,
      intensity: this.intensity
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  canBeAdded(): boolean {
    return getCountOfComponentType(AmbientLightComponent) === 0
  }
}

export const AmbientLightComponent = createMappedComponent<AmbientLightData>('AmbientLightComponent')
