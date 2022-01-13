import { Object3D, Vector3 } from 'three'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { SplineComponent, SplineComponentType } from '../../components/SplineComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import Spline from '../../classes/Spline'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_SPLINE = 'spline'
export const SCENE_COMPONENT_SPLINE_DEFAULT_VALUES = {
  splinePositions: [] as Vector3[]
}

export const deserializeSpline: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<SplineComponentType>
) => {
  const obj3d = new Object3D()

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, SplineComponent, json.props)

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SPLINE)

    const helper = new Spline()
    obj3d.add(helper)
    obj3d.userData.helper = helper

    helper.init(json.props.splinePositions)
  }

  updateSpline(entity)
}

export const updateSpline: ComponentUpdateFunction = (_: Entity, properties: SplineComponentType) => {}

export const serializeSpline: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SplineComponent) as SplineComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SPLINE,
    props: {
      splinePositions: component.splinePositions
    }
  }
}
