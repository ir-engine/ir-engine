import { Object3D, BoxHelper, Mesh, BoxBufferGeometry } from 'three'
import { LoadGLTF } from '../../assets/functions/LoadGLTF'
import { ComponentName } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  hasComponent
} from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'

// TODO: add circle option
let spawnPointHelperModel: Object3D = null!
const GLTF_PATH = '/static/editor/spawn-point.glb' // Static

export const deserializeSpawnPoint: ComponentDeserializeFunction = async (entity: Entity) => {
  addComponent(entity, SpawnPointComponent, {})

  if (Engine.isEditor) {
    const obj3d = new Object3D()

    if (!spawnPointHelperModel) {
      const { scene } = await LoadGLTF(GLTF_PATH)
      spawnPointHelperModel = scene
    }

    obj3d.userData.helperModel = spawnPointHelperModel.clone()
    obj3d.add(obj3d.userData.helperModel)
    obj3d.userData.helperBox = new BoxHelper(new Mesh(new BoxBufferGeometry(1, 0, 1).translate(0, 0, 0)), 0xffffff)
    obj3d.add(obj3d.userData.helperBox)

    addComponent(entity, Object3DComponent, { value: obj3d })
  }
}

export const serializeSpawnPoint: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, SpawnPointComponent)) {
    return {
      name: ComponentName.SPAWN_POINT,
      props: {}
    }
  }
}
