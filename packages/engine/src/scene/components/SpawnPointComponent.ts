import { BoxBufferGeometry, BoxHelper, Group, Mesh, Object3D } from 'three'
import { LoadGLTF } from '../../assets/functions/LoadGLTF'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

const GLTF_PATH = '/editor/spawn-point.glb' // Static

class SpawnPointHelper {
  static model
  static isLoaded

  static async load() {
    const { scene } = await LoadGLTF(GLTF_PATH)
    this.model = scene
  }
}

export class SpawnPointData implements ComponentData {
  static legacyComponentName = ComponentNames.SPAWN_POINT

  constructor(obj3d: Object3D, showHelper: boolean = false) {
    this.obj3d = obj3d

    if (showHelper) {
      this.initComponent()
    }
  }

  async initComponent() {
    if (!SpawnPointHelper.isLoaded) await SpawnPointHelper.load()

    this.helperModel = SpawnPointHelper.model.clone()
    this.helperBox = new BoxHelper(new Mesh(new BoxBufferGeometry(1, 0, 1).translate(0, 0, 0)), 0xffffff)
    this.helperModel?.add(this.helperBox)
    this.obj3d.add(this.helperModel)
  }

  helperBox?: BoxHelper
  helperModel: Object3D
  obj3d: Object3D

  serialize(): object {
    return {}
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const SpawnPointComponent = createMappedComponent<SpawnPointData>(ComponentNames.SPAWN_POINT)
