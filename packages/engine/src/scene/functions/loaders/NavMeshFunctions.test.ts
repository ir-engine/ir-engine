import assert from 'assert'
import proxyquire from 'proxyquire'
import { BoxGeometry, Mesh, Object3D } from 'three'
import { NavMesh } from 'yuka'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { NavMeshComponent } from '../../components/NavMeshComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SCENE_COMPONENT_MODEL, SCENE_COMPONENT_MODEL_DEFAULT_VALUE } from './ModelFunctions'
import { SCENE_COMPONENT_NAV_MESH } from './NavMeshFunctions'

class Fake {
  polygons: any[]
  fromPolygons(polygons: any[]) {
    this.polygons = polygons
  }
}

describe('NavMeshFunctions', () => {
  let entity: Entity
  let fns = proxyquire('./NavMeshFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../../classes/NavMesh': { NavMesh: Fake }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_NAV_MESH,
    props: sceneComponentData
  }

  describe('deserializeNavMesh()', () => {
    it('does not create Component on the server', () => {
      const serverFns = proxyquire('./NavMeshFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      serverFns.deserializeNavMesh(entity, sceneComponent)

      const component = getComponent(entity, NavMeshComponent)
      assert(!component)
    })

    it('creates Component with provided data', () => {
      fns.deserializeNavMesh(entity, sceneComponent)

      const component = getComponent(entity, NavMeshComponent)
      assert(component)
      assert(Object.keys(component).length <= 1, 'too many keys')
      assert(component.value instanceof Fake, 'not created')
    })

    it('creates an Object3D Component with provided component data', () => {
      fns.deserializeNavMesh(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof Object3D, 'not created')
      assert(obj3d.userData.disableOutline, 'outline is not disabled')
    })

    it('ensures a Model Component with default component data', () => {
      fns.deserializeNavMesh(entity, sceneComponent)

      const c = getComponent(entity, ModelComponent)
      assert(c, 'not created')
      for (let key in SCENE_COMPONENT_MODEL_DEFAULT_VALUE) {
        assert(c[key] === SCENE_COMPONENT_MODEL_DEFAULT_VALUE[key], key + ' not set')
      }
    })

    it('does not overwrite an exising Model Component', () => {
      addComponent(entity, ModelComponent, { src: '://model' } as any)
      fns.deserializeNavMesh(entity, sceneComponent)

      const c = getComponent(entity, ModelComponent)

      c.src = '://model'

      assert(c.src === '://model')
    })

    it('will include these component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      fns.deserializeNavMesh(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_MODEL))
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_NAV_MESH))
    })
  })

  describe('updateNavMesh()', () => {
    it('updates the nav mesh component using polygons from the object3d component', () => {
      // Caveat: the Object3D must be a Mesh for there to be any polygons to add
      const box = new BoxGeometry()
      const mesh = new Mesh(box)

      addComponent(entity, NavMeshComponent, { value: new Fake() as unknown as NavMesh })
      addComponent(entity, Object3DComponent, { value: mesh })

      fns.updateNavMesh(entity, {})

      const fakeNavMesh = getComponent(entity, NavMeshComponent).value
      const polygons = (fakeNavMesh as unknown as Fake).polygons
      // a BoxGeometry has 6 sides with 2 triangles per side
      assert.equal(polygons.length, 12, 'not the right number of polygons')
    })
  })

  describe('serializeNavMesh()', () => {
    it('should properly serialize', () => {
      fns.deserializeNavMesh(entity, sceneComponent)
      assert.deepEqual(fns.serializeNavMesh(entity), sceneComponent)
    })
    it('should return undefined if there is no such component', () => {
      assert(fns.serializeNavMesh(entity) === undefined)
    })
  })
})
