import { Mesh } from 'three'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { Object3DComponent } from '../components/Object3DComponent'
import { TriggerVolumeComponent, TriggerVolumeData } from '../components/TriggerVolumeComponent'


// TODO: Remove below
export const createTriggerVolume = function (entity, args): void {
  const object3dComponent = getComponent(entity, Object3DComponent)

  addComponent<TriggerVolumeData, {}>(
    entity,
    TriggerVolumeComponent,
    new TriggerVolumeData(object3dComponent.value as Mesh, args)
  )

  createCollider(entity, object3dComponent.value as Mesh)
}
