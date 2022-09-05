import { Group } from 'three'

import { ComponentDeserializeFunction, ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  serializeComponent,
  SerializedComponentType,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { ImageComponent } from '../../components/ImageComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeImage: ComponentDeserializeFunction = (
  entity: Entity,
  data: SerializedComponentType<typeof ImageComponent>
) => {
  if (data['imageSource']) data.source = data['imageSource'] // backwards-compat
  setComponent(entity, ImageComponent, data)
}

export const serializeImage = (entity: Entity) => {
  return serializeComponent(entity, ImageComponent)
}

export const updateImage: ComponentUpdateFunction = async (entity: Entity) => {
  const image = getComponent(entity, ImageComponent)
  const mesh = image.mesh.value

  if (!hasComponent(entity, Object3DComponent)) {
    addComponent(entity, Object3DComponent, { value: new Group() })
  }

  const group = getComponent(entity, Object3DComponent).value
  if (mesh.parent !== group) group.add(mesh)
}
