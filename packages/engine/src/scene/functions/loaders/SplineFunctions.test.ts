import assert from 'assert'
import { Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SplineComponent } from '../../components/SplineComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { deserializeSpline, parseSplineProperties, SCENE_COMPONENT_SPLINE, serializeSpline } from './SplineFunctions'

describe('SplineFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    splinePositions: [
      new Vector3(Math.random(), Math.random(), Math.random()),
      new Vector3(Math.random(), Math.random(), Math.random()),
      new Vector3(Math.random(), Math.random(), Math.random())
    ]
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SPLINE,
    props: sceneComponentData
  }

  describe('deserializeSpline()', () => {
    it('creates Spline Component with provided component data', () => {
      deserializeSpline(entity, sceneComponent)

      const splineComponent = getComponent(entity, SplineComponent)
      assert(splineComponent)
      assert.deepEqual(splineComponent, sceneComponentData)
    })

    it('creates Spline Object3D with provided component data', () => {
      deserializeSpline(entity, sceneComponent)
      const obj3d = getComponent(entity, Object3DComponent)?.value

      assert(obj3d, 'Spline is not created')
      assert(obj3d.children.length > 0 && obj3d.userData.helper && obj3d.userData.helper.userData.isHelper)
      assert(obj3d.userData.helper.layers.isEnabled(ObjectLayers.NodeHelper))
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeSpline(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SPLINE))
    })
  })

  describe.skip('updateSpline', () => {})

  describe('serializeSpline()', () => {
    it('should properly serialize spline', () => {
      deserializeSpline(entity, sceneComponent)
      assert.deepEqual(serializeSpline(entity), sceneComponent)
    })

    it('should return undefine if there is no spline component', () => {
      assert(serializeSpline(entity) === undefined)
    })
  })

  describe('parseSplineProperties()', () => {
    const data = it('should return empty array of spline ponits', () => {
      const data = {}
      const componentData = parseSplineProperties(data)
      assert(componentData.splinePositions.length <= 0)
      assert(data !== componentData)
    })

    it('should return Vector3 array of spline ponits', () => {
      const componentData = parseSplineProperties(sceneComponentData)
      assert(componentData.splinePositions.length > 0)
      assert(sceneComponentData !== componentData)
      assert(
        componentData.splinePositions.filter((pos, i) => {
          if (
            pos.x !== sceneComponentData.splinePositions[i].x ||
            pos.y !== sceneComponentData.splinePositions[i].y ||
            pos.z !== sceneComponentData.splinePositions[i].z
          )
            return true
        }).length <= 0
      )
    })
  })
})
