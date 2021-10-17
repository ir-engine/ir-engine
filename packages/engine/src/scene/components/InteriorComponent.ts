import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'
import { Vector2 } from 'three'
import { Interior } from '../classes/Interior'

export type InteriorDataProps = {
  cubeMap: string
  tiling: number
  size: Vector2
}

export class InteriorData implements ComponentData {
  static legacyComponentName = ComponentNames.INTERIOR

  constructor(obj3d: Interior, props?: InteriorDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.cubeMap = props.cubeMap
      this.tiling = props.tiling
    }
  }

  obj3d: Interior

  get cubeMap() {
    return this.obj3d.cubeMap
  }

  set cubeMap(cubeMap: string) {
    this.obj3d.cubeMap = cubeMap
  }

  get tiling() {
    return this.obj3d.tiling
  }

  set tiling(tiling: number) {
    this.obj3d.tiling = tiling
  }

  get size() {
    return this.obj3d.size
  }

  set size(size: Vector2) {
    this.obj3d.size = size
  }

  serialize(): InteriorDataProps {
    return {
      cubeMap: this.cubeMap,
      tiling: this.tiling,
      size: this.size,
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const InteriorComponent = createMappedComponent<InteriorData>('InteriorComponent')
