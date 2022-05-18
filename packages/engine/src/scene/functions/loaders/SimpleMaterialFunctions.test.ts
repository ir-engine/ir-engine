import assert from 'assert'
import {
  BoxGeometry,
  Material,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D
} from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { SimpleMaterialTagComponent } from '../../components/SimpleMaterialTagComponent'
import { SceneOptions } from '../../systems/SceneObjectSystem'
import {
  deserializeSimpleMaterial,
  SCENE_COMPONENT_SIMPLE_MATERIALS,
  serializeSimpleMaterial,
  useSimpleMaterial,
  useStandardMaterial
} from './SimpleMaterialFunctions'

SceneOptions.instance = new SceneOptions()
SceneOptions.instance.boxProjection = true

describe('SimpleMaterialFunctions', () => {
  let world: World
  let entity: Entity

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {
    simpleMaterials: {}
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SIMPLE_MATERIALS,
    props: sceneComponentData
  }

  describe('deserializeSimpleMaterial()', () => {
    it('does not create SimpleMaterial Component if "simpleMaterials" is undefined', () => {
      deserializeSimpleMaterial(entity, { ...sceneComponent, props: {} })

      const simplematerialComponent = getComponent(entity, SimpleMaterialTagComponent)
      assert(!simplematerialComponent)
    })

    it('creates SimpleMaterial Component with provided component data', () => {
      deserializeSimpleMaterial(entity, sceneComponent)

      const simplematerialComponent = getComponent(entity, SimpleMaterialTagComponent)
      assert(simplematerialComponent)
      assert(Object.keys(simplematerialComponent).length === 0)
    })

    describe('Editor vs Location', () => {
      it('creates SimpleMaterial in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeSimpleMaterial(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_SIMPLE_MATERIALS))
      })

      it('creates SimpleMaterial in Editor', () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeSimpleMaterial(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SIMPLE_MATERIALS))

        Engine.isEditor = false
      })
    })
  })

  describe('serializeSimpleMaterial()', () => {
    it('should properly serialize simplematerial', () => {
      deserializeSimpleMaterial(entity, sceneComponent)
      assert.deepEqual(serializeSimpleMaterial(entity), sceneComponent)
    })

    it('should return undefine if there is no simplematerial component', () => {
      assert(serializeSimpleMaterial(entity) === undefined)
    })
  })

  describe('useSimpleMaterial()', () => {
    it('replaces MeshStandardMaterial to MeshPhongMaterial', () => {
      const mat = new MeshStandardMaterial()
      const obj3d = new Mesh(new BoxGeometry(), mat)
      useSimpleMaterial(obj3d)

      assert(obj3d.material instanceof MeshPhongMaterial)
      assert(obj3d.userData.prevMaterial === mat)
    })

    it('does not replace material other than MeshStandardMaterial', () => {
      const mat = new MeshLambertMaterial()
      const obj3d = new Mesh(new BoxGeometry(), mat)
      useSimpleMaterial(obj3d)

      assert(obj3d.material instanceof MeshLambertMaterial)
    })
  })

  describe('useStandardMaterial()', () => {
    it('does nothing if there no material', () => {
      const mat = new MeshStandardMaterial()
      const obj3d = new Object3D()
      useStandardMaterial(obj3d as Mesh<any, Material>)

      assert(!obj3d.userData.material)
    })

    it('restores previous material', () => {
      const mat = new MeshStandardMaterial()
      const obj3d = new Mesh(new BoxGeometry(), new MeshPhongMaterial())
      obj3d.receiveShadow = true
      Engine.csm = { setupMaterial() {} } as any
      obj3d.userData.prevMaterial = mat

      useStandardMaterial(obj3d)

      assert(obj3d.material === (mat as any))
      assert((obj3d.material as any).envMapIntensity === SceneOptions.instance.envMapIntensity)
      assert(typeof obj3d.userData.prevMaterial === 'undefined')
    })
  })
})
