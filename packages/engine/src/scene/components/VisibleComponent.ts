import { Object3D } from 'three'
import { CameraLayers } from '../../camera/constants/CameraLayers'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VisibleDataProps = {
  visible: boolean
  persist: boolean
  includeInCubeMapBake: boolean
  name: string
}

export class VisibleData implements ComponentData {
  static legacyComponentName = ComponentNames.VISIBILE

  constructor(obj3d: Object3D, props?: VisibleDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.visible = props.visible
      this.name = props.name
      this.includeInCubeMapBake = props.includeInCubeMapBake
      this.persist = props.persist
    }
  }

  obj3d: Object3D
  _persist: boolean

  get visible() {
    return this.obj3d.visible
  }

  set visible(visible: boolean) {
    this.obj3d.visible = visible
  }

  get name() {
    return this.obj3d.name
  }

  set name(name: string) {
    this.obj3d.name = name
  }

  get persist() {
    return this._persist
  }

  set persist(persist: boolean) {
    this._persist = persist

    if (persist) {
      this.obj3d.traverse((obj) => {
        obj.layers.enable(CameraLayers.Portal)
      })
    }
  }

  get includeInCubeMapBake() {
    return this.obj3d['includeInCubeMapBake']
  }

  set includeInCubeMapBake(includeInCubeMapBake: boolean) {
    this.obj3d['includeInCubeMapBake'] = includeInCubeMapBake
  }

  serialize(): object {
    return {
      visible: this.visible,
      persist: this.persist,
      name: this.name,
      includeInCubeMapBake: this.includeInCubeMapBake
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const VisibleComponent = createMappedComponent<VisibleData>('VisibleComponent')
