import { Fog, FogExp2, Scene, Color } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { FogType, FogTypeType } from '../constants/FogType'

export type FogDataProps = {
  type: FogTypeType
  color: string
  density: number
  near: number
  far: number
}

export class FogData implements ComponentData {
  static legacyComponentName = ComponentNames.FOG

  constructor(scene: Scene, props?: FogDataProps) {
    this.scene = scene

    if (props) {
      this.color = new Color(props.color)
      this.type = props.type

      if (props.type === FogType.Disabled) return

      if (props.type === FogType.Linear) {
        this.near = props.near
        this.far = props.far
      } else {
        this.density = props.density
      }
    }
  }

  scene: Scene

  get type() {
    if (this.scene.fog instanceof Fog) return FogType.Linear
    if (this.scene.fog instanceof FogExp2) return FogType.Exponential
    return FogType.Disabled
  }

  set type(type: FogTypeType) {
    if (this.type === type) return

    if (type === FogType.Linear) {
      this.scene.fog = new Fog(this.color || new Color(), this.near, this.far)
    } else if (type === FogType.Exponential) {
      this.scene.fog = new FogExp2(this.color ? this.color.getHex() : '#ffffff', this.density)
    } else {
      this.scene.fog = null
    }
  }

  get color() {
    return this.scene.fog?.color
  }

  set color(color: Color | undefined) {
    if (this.scene.fog) {
      if (!color) {
        this.scene.fog.color.set('#ffffff')
        return
      }

      this.scene.fog.color.set(color)
    }
  }

  get near() {
    if (this.scene.fog instanceof Fog) {
      return this.scene.fog.near
    }

    return 0
  }

  set near(near: number) {
    if (this.scene.fog instanceof Fog) {
      this.scene.fog.near = near
    }
  }

  get far() {
    if (this.scene.fog instanceof Fog) {
      return this.scene.fog.far
    }

    return 0
  }

  set far(far: number) {
    if (this.scene.fog instanceof Fog) {
      this.scene.fog.far = far
    }
  }

  get density() {
    if (this.scene.fog instanceof FogExp2) {
      return this.scene.fog.density
    }

    return 0
  }

  set density(density: number) {
    if (this.scene.fog instanceof FogExp2) {
      this.scene.fog.density = density
    }
  }

  serialize(): object {
    return {

    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const FogComponent = createMappedComponent<FogData>('FogComponent')
