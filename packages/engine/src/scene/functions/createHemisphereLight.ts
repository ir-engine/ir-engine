import { Color, HemisphereLight } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneDataComponent } from '../functions/SceneLoading'

export const createHemisphereLight = (entity: Entity, component: SceneDataComponent) => {
  if (!isClient || !component) return

  const light = new HemisphereLight()

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DisableTransformTagComponent, {})

  addComponent(entity, HemisphereLightComponent, {
    ...component.props,
    skyColor: new Color(component.props.skyColor),
    groundColor: new Color(component.props.groundColor),
    dirty: true
  })
}
