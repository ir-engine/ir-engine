import { Color, HemisphereLight } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent, getCountOfComponentType } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'

export type HemisphereLightDataProps = {
  skyColor?: Color,
  groundColor?: Color,
  intensity?: number
}

export class HemisphereLightData implements ComponentData {
  static legacyComponentName = ComponentNames.HEMISPHERE_LIGHT
  static metadata: [
    {
      name: 'skyColor',
      displayName: 'Sky Color',
      type: 'Color',
    },
    {
      name: 'groundColor',
      displayName: 'Ground Color',
      type: 'Color',
    },
    {
      name: 'intensity',
      displayName: 'Intensity',
      type: 'Number',
      unit: 'cd'
    }
  ]

  constructor(obj3d: HemisphereLight, props?: HemisphereLightDataProps) {
    this.obj3d = obj3d

    if (props) {
      if (props.skyColor) {
        this.skyColor = typeof props.skyColor === 'string' ? new Color(props.skyColor) : props.skyColor
      }

      if (props.groundColor) {
        this.groundColor =  typeof props.groundColor === 'string' ? new Color(props.groundColor) : props.groundColor
      }

      if (props.intensity != null) {
        this.intensity = props.intensity
      }
    }
  }

  obj3d: HemisphereLight

  get skyColor() {
    return this.obj3d.color
  }

  set skyColor(color: Color) {
    this.obj3d.color = color
  }

  get groundColor() {
    return this.obj3d.groundColor
  }

  set groundColor(color: Color) {
    this.obj3d.groundColor = color
  }

  get intensity() {
    return this.obj3d.intensity
  }

  set intensity(intensity: number) {
    this.obj3d.intensity = intensity
  }

  serialize(): HemisphereLightDataProps {
    return {
      skyColor: this.skyColor,
      groundColor: this.groundColor,
      intensity: this.intensity
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  canBeAdded(): boolean {
    return getCountOfComponentType(HemisphereLightComponent) === 0
  }
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightData>(ComponentNames.HEMISPHERE_LIGHT)
