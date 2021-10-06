import { BoxBufferGeometry, BoxHelper, Group, Mesh } from 'three'
import { LoadGLTF } from '../../assets/functions/LoadGLTF'
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

export class SpawnPointComponentClass {
  static legacyComponentName = 'spawn-point'
  static nodeName = 'Spawn Point'

  constructor(showHelper: boolean = false) {
    if (showHelper) {
      this.initComponent()
    }
  }

  async initComponent() {
    if (!SpawnPointHelper.isLoaded) await SpawnPointHelper.load()

    this.obj3d = SpawnPointHelper.model.clone()
    this.helperBox = new BoxHelper(new Mesh(new BoxBufferGeometry(1, 0, 1).translate(0, 0, 0)), 0xffffff)
    this.obj3d?.add(this.helperBox)
  }

  helperBox?: BoxHelper
  obj3d?: Group
}

export const SpawnPointComponent = createMappedComponent<SpawnPointComponentClass>('SpawnPointComponent')
