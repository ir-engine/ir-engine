import { Color, HemisphereLight } from 'three'
import { Engine } from '../../../dist'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Component } from './Component'

/** Component Class for Object3D type from three.js.  */

export type HemisphereLightComponentProps = {
  skyColor: Color,
  groundColor: Color,
  intensity: number
  obj3d?: HemisphereLight
}

export class HemisphereLightComponentClass implements Component {
  static legacyComponentName = 'hemisphere-light'
  static nodeName = 'Hemisphere Light'
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

  constructor(props: HemisphereLightComponentProps) {
    this.obj3d = props.obj3d ?? new HemisphereLight()
    this.skyColor = typeof props.skyColor === 'string' ? new Color(props.skyColor) : props.skyColor
    this.groundColor =  typeof props.groundColor === 'string' ? new Color(props.groundColor) : props.groundColor
    this.intensity = props.intensity
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

  dirty?: boolean

  serialize(): HemisphereLightComponentProps {
    return {
      skyColor: this.skyColor,
      groundColor: this.groundColor,
      intensity: this.intensity
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  deserialize(props): HemisphereLightComponentClass {
    return new HemisphereLightComponentClass(props)
  }

  deserializeFromJSON(json: string): HemisphereLightComponentClass {
    return this.deserialize(JSON.parse(json))
  }

  canBeAdded(): boolean {
    return true
    // Engine.scene.findNodeByType(HemisphereLightNode) === null
  }
}

export const HemisphereLightComponent = createMappedComponent<HemisphereLightComponentClass>('HemisphereLightComponent')
