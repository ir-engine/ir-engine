import { AmbientLight, BoxBufferGeometry, Color, DirectionalLight, Euler, Fog, HemisphereLight, MathUtils, Mesh, MeshNormalMaterial, Object3D, PointLight, Quaternion, Scene, SphereBufferGeometry, SpotLight, Vector3 } from 'three'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getGeometryScale } from "../../physics/classes/Physics"
import assert from 'assert'
import { createWorld } from "../../ecs/classes/World"
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { Engine } from '../../ecs/classes/Engine'
import { loadComponent } from './SceneLoading'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { FogType } from '../constants/FogType'
import { FogComponent } from '../components/FogComponent'
import { PositionalAudioSettingsComponent } from '../components/AudioSettingsComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { PortalComponent } from '../components/PortalComponent'
import { BodyType } from '../../physics/types/PhysicsTypes'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

const EPSILON = 10e-9

// these need to be rewritten into the new format
describe.skip('SceneLoading.test', () => {

  describe('can load scene data from json', () => {

    it('mtdata', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()
      const testData = MathUtils.generateUUID()

      const sceneComponentData = {
        meta_data: testData
      }
      const sceneComponent: ComponentJson = {
        name: 'mtdata',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert.equal(world.sceneMetadata, testData)

    })

    it('_metadata', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()
      const randomVector3 = new Vector3().random()
      addComponent(entity, TransformComponent, {
        position: randomVector3.clone(),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1)
      })

      const testData = MathUtils.generateUUID()
      const sceneComponentData = {
        _data: testData
      }
      const sceneComponent: ComponentJson = {
        name: '_metadata',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert.equal(world.worldMetadata[testData], `${randomVector3.x},${randomVector3.y},${randomVector3.z}`)
      assert(hasComponent(entity, Object3DComponent))
      assert.equal((getComponent(entity, Object3DComponent).value as any)._data, testData)
      assert(hasComponent(entity, InteractableComponent))
      assert.equal(getComponent(entity, InteractableComponent).action, '_metadata')

    })

    it('ambient-light', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const color = new Color('red')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5
      }
      const sceneComponent: ComponentJson = {
        name: 'ambient-light',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof AmbientLight)
      assert((getComponent(entity, Object3DComponent).value as AmbientLight).color instanceof Color)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as AmbientLight).color.toArray(), color.toArray())
      assert.deepEqual((getComponent(entity, Object3DComponent).value as AmbientLight).intensity, 5)

    })

    describe('directional-light', async () => {

      // reset globals
      afterEach(() => {
        Engine.directionalLights = []
      })

      it('with CSM', () => {
        const world = createWorld()
        Engine.currentWorld = world
        Engine.currentWorld = world
        Engine.isCSMEnabled = true
        Engine.directionalLights = []

        const entity = createEntity()

        const color = new Color('green')
        const sceneComponentData = {
          color: color.clone(),
          intensity: 5,
          castShadow: true,
          shadowMapResolution: [32, 32],
          shadowBias: 0.1,
          shadowRadius: 10,
          cameraFar: 123
        }
        const sceneComponent: ComponentJson = {
          name: 'directional-light',
          props: sceneComponentData
        }

        loadComponent(entity, sceneComponent)

        const light = Engine.directionalLights[0]

        assert(!hasComponent(entity, Object3DComponent))
        assert(light)
        assert(light.color instanceof Color)
        assert.deepEqual(light.color.toArray(), color.toArray())
        assert.deepEqual(light.intensity, 5)
        assert.deepEqual(light.shadow.mapSize, { x: 32, y: 32 })
        assert.deepEqual(light.shadow.bias, 0.1)
        assert.deepEqual(light.shadow.radius, 10)
        assert.deepEqual(light.shadow.camera.far, 123)
        assert.deepEqual(light.castShadow, true)

      })


      it('without CSM', () => {
        const world = createWorld()
        Engine.currentWorld = world
        Engine.currentWorld = world
        Engine.isCSMEnabled = false

        const entity = createEntity()

        const color = new Color('green')
        const sceneComponentData = {
          color: color.clone(),
          intensity: 6,
          castShadow: true,
          shadowMapResolution: [64, 64],
          shadowBias: 0.01,
          shadowRadius: 20,
          cameraFar: 256
        }
        const sceneComponent: ComponentJson = {
          name: 'directional-light',
          props: sceneComponentData
        }

        loadComponent(entity, sceneComponent)

        assert(hasComponent(entity, Object3DComponent))
        assert(getComponent(entity, Object3DComponent).value instanceof DirectionalLight)
        assert((getComponent(entity, Object3DComponent).value as DirectionalLight).color instanceof Color)
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).color.toArray(), color.toArray())
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).intensity, 6)
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.mapSize, { x: 64, y: 64 })
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.bias, 0.01)
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.radius, 20)
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.camera.far, 256)
        assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).castShadow, true)

      })

    })

    it('hemisphere-light', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const color = new Color('pink')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5
      }
      const sceneComponent: ComponentJson = {
        name: 'hemisphere-light',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof HemisphereLight)
      assert((getComponent(entity, Object3DComponent).value as HemisphereLight).color instanceof Color)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as HemisphereLight).color.toArray(), color.toArray())
      assert.deepEqual((getComponent(entity, Object3DComponent).value as HemisphereLight).intensity, 5)

    })

    it('point-light', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const color = new Color('pink')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5
      }
      const sceneComponent: ComponentJson = {
        name: 'point-light',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof PointLight)
      assert((getComponent(entity, Object3DComponent).value as PointLight).color instanceof Color)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as PointLight).color.toArray(), color.toArray())
      assert.deepEqual((getComponent(entity, Object3DComponent).value as PointLight).intensity, 5)

    })

    it('spot-light', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const color = new Color('brown')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5
      }
      const sceneComponent: ComponentJson = {
        name: 'spot-light',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof SpotLight)
      assert((getComponent(entity, Object3DComponent).value as SpotLight).color instanceof Color)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as SpotLight).color.toArray(), color.toArray())
      assert.deepEqual((getComponent(entity, Object3DComponent).value as SpotLight).intensity, 5)

    })

    it('simple-materials', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {
        simpleMaterials: true
      }
      const sceneComponent: ComponentJson = {
        name: 'simple-materials',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(Engine.simpleMaterials)

      // todo: this will be unnecessary when engine global state is refactored
      Engine.simpleMaterials = false

    })

    // TODO: this is kinda hard to test as it is async and can be covered in other tests
    it.skip('gltf-model', async () => {

    })

    // TODO: this is currently unused and needs to be re-implemented
    it.skip('loop-animation', async () => {

    })

    it('interact', () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {
        interactable: true,
        interactionType: "interaction type",
        interactionText: "interaction text",
        interactionName: "interaction name",
        interactionDescription: "interaction description",
        interactionImages: [],
        interactionVideos: [],
        interactionUrls: [],
        interactionModels: []
      }
      const sceneComponent: ComponentJson = {
        name: 'interact',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)


      assert(hasComponent(entity, InteractableComponent))
      assert(getComponent(entity, InteractableComponent).interactable)
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionType, 'interaction type')
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionText, 'interaction text')
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionName, 'interaction name')
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionDescription, 'interaction description')
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionImages, [])
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionVideos, [])
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionUrls, [])
      assert.deepEqual(getComponent(entity, InteractableComponent).interactionModels, [])

    })

    // TODO: these are currently hard to test being client only and need to be re-implemented
    it.skip('audio', async () => { })
    it.skip('video', async () => { })
    it.skip('volumetric', async () => { })
    it.skip('image', async () => { })

    // TODO
    it.skip('map', async () => { })

    it('transform', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const quat = new Quaternion().random()
      const euler = new Euler().setFromQuaternion(quat, 'XYZ')
      const sceneComponentData = {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: euler.x, y: euler.y, z: euler.z },
        scale: { x: 0.1, y: 0.2, z: 0.3 },
      }
      const sceneComponent: ComponentJson = {
        name: 'transform',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, TransformComponent))
      const { position, rotation, scale } = getComponent(entity, TransformComponent)
      assert.equal(position.x, 1)
      assert.equal(position.y, 2)
      assert.equal(position.z, 3)

      // must compare absolute as negative quaternions represent equivalent rotations
      assert(Math.abs(rotation.x) - Math.abs(quat.x) < EPSILON)
      assert(Math.abs(rotation.y) - Math.abs(quat.y) < EPSILON)
      assert(Math.abs(rotation.z) - Math.abs(quat.z) < EPSILON)
      assert(Math.abs(rotation.w) - Math.abs(quat.w) < EPSILON)

      assert.equal(scale.x, 0.1)
      assert.equal(scale.y, 0.2)
      assert.equal(scale.z, 0.3)

    })

    it('fog', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world
      Engine.scene = new Scene()

      const entity = createEntity()

      const sceneComponentData = {
        type: FogType.Linear,
        color: 'grey',
        density: 2,
        near: 0.1,
        far: 1000
      }
      const sceneComponent: ComponentJson = {
        name: 'fog',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, FogComponent))
      const { type, color, density, near, far } = getComponent(entity, FogComponent)
      assert.equal(type, FogType.Linear)
      assert.equal(color, 'grey')
      assert.equal(density, 2)
      assert.equal(near, 0.1)
      assert.equal(far, 1000)

      assert(Engine.scene.fog instanceof Fog)

      // TODO: unnecessary once engine global scope is refactored
      Engine.scene = null!

    })

    // TODO: currently client only - needs refactoring
    it.skip('skybox', async () => { })

    it('audio-settings', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {
        avatarDistanceModel: 'avatar distance model',
        avatarMaxDistance: Math.random(),
        avatarRefDistance: Math.random(),
        avatarRolloffFactor: Math.random(),
        mediaConeInnerAngle: Math.random(),
        mediaConeOuterAngle: Math.random(),
        mediaConeOuterGain: Math.random(),
        mediaDistanceModel: 'distance model',
        mediaMaxDistance: Math.random(),
        mediaRefDistance: Math.random(),
        mediaRolloffFactor: Math.random(),
        mediaVolume: Math.random(),
        usePositionalAudio: true
      }
      const sceneComponent: ComponentJson = {
        name: 'audio-settings',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, PositionalAudioSettingsComponent))
      const component = getComponent(entity, PositionalAudioSettingsComponent)
      assert.equal(sceneComponentData.avatarDistanceModel, component.avatarDistanceModel)
      assert.equal(sceneComponentData.avatarMaxDistance, component.avatarMaxDistance)
      assert.equal(sceneComponentData.avatarRefDistance, component.avatarRefDistance)
      assert.equal(sceneComponentData.avatarRolloffFactor, component.avatarRolloffFactor)
      assert.equal(sceneComponentData.mediaConeInnerAngle, component.mediaConeInnerAngle)
      assert.equal(sceneComponentData.mediaConeOuterAngle, component.mediaConeOuterAngle)
      assert.equal(sceneComponentData.mediaConeOuterGain, component.mediaConeOuterGain)
      assert.equal(sceneComponentData.mediaDistanceModel, component.mediaDistanceModel)
      assert.equal(sceneComponentData.mediaMaxDistance, component.mediaMaxDistance)
      assert.equal(sceneComponentData.mediaRefDistance, component.mediaRefDistance)
      assert.equal(sceneComponentData.mediaRolloffFactor, component.mediaRolloffFactor)
      assert.equal(sceneComponentData.mediaVolume, component.mediaVolume)
      assert.equal(sceneComponentData.usePositionalAudio, component.usePositionalAudio)

    })

    it('renderer-settings', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world
      Engine.isCSMEnabled = false

      const entity = createEntity()

      const sceneComponentData = {
        csm: true
      }
      const sceneComponent: ComponentJson = {
        name: 'renderer-settings',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert.equal(Engine.isCSMEnabled, true)
      // TODO: currently renderer only is created on client

      // TODO: unnecessary once engine global scope is refactored
      Engine.isCSMEnabled = false
    })

    it('spawn-point', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {}
      const sceneComponent: ComponentJson = {
        name: 'spawn-point',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, SpawnPointComponent))
    })

    // TODO: currently client only
    it.skip('scene-preview-camera', async () => { })

    it('shadow', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {
        cast: true,
        receive: true
      }
      const sceneComponent: ComponentJson = {
        name: 'shadow',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, ShadowComponent))
      assert(getComponent(entity, ShadowComponent).castShadow)
      assert(getComponent(entity, ShadowComponent).receiveShadow)
    })

    it('collider', async () => { 
      const world = createWorld()
      Engine.currentWorld = world
      await Engine.currentWorld.physics.createScene({ verbose: true })
      
      const entity = createEntity(world)
      const type = 'trimesh'
      let geom = new SphereBufferGeometry()

      const scale = new Vector3(2, 2, 2)
      const mesh = new Mesh(geom, new MeshNormalMaterial())
      mesh.scale.x = scale.x
      mesh.scale.y = scale.y
      mesh.scale.z = scale.z
      const bodyOptions = {
        type,
        bodyType: BodyType.DYNAMIC
      }
      mesh.userData = bodyOptions

      addComponent(entity, Object3DComponent, {
        value: mesh
      })

      addComponent(entity, TransformComponent, {
        position: new Vector3(0,2,0),
        rotation: new Quaternion(),
        scale: new Vector3(1,1,1)
      })

      const sceneComponentData = bodyOptions
      const sceneComponent: ComponentJson = {
        name: 'collider',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, ColliderComponent))
      const body = getComponent(entity, ColliderComponent).body
      assert.deepEqual(body._type, bodyOptions.bodyType)
      const shapes = Engine.currentWorld.physics.getRigidbodyShapes(body)
      for (let shape of shapes) {
        const shapeScale = getGeometryScale(shape)
        assert.equal(shapeScale.x, scale.x)
        assert.equal(shapeScale.y, scale.y)
        assert.equal(shapeScale.z, scale.z)
      }
      assert(hasComponent(entity, CollisionComponent))

      // clean up physx
      delete (globalThis as any).PhysX
    })

    // TODO: kinda complex, and covered by physics tests
    it('box-collider', async () => { 
      const world = createWorld()
      Engine.currentWorld = world
      await Engine.currentWorld.physics.createScene({ verbose: true })
      
      const entity = createEntity(world)
      const type = 'box'

      const scale = new Vector3(2, 3, 4)
      const geom = new BoxBufferGeometry(scale.x, scale.y, scale.z)

      const mesh = new Mesh(geom, new MeshNormalMaterial())
      const bodyOptions = {
        type,
        bodyType: BodyType.STATIC
      }
      mesh.userData = bodyOptions

      addComponent(entity, Object3DComponent, {
        value: mesh
      })

      addComponent(entity, TransformComponent, {
        position: new Vector3(0,2,0),
        rotation: new Quaternion(),
        scale: scale
      })

      const sceneComponentData = bodyOptions
      const sceneComponent: ComponentJson = {
        name: 'box-collider',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, ColliderComponent))
      const body = getComponent(entity, ColliderComponent).body
      assert.deepEqual(body._type, bodyOptions.bodyType)
      const shapes = Engine.currentWorld.physics.getRigidbodyShapes(body)
      for (let shape of shapes) {
        const shapeScale = getGeometryScale(shape)
        assert.equal(shapeScale.x, scale.x)
        assert.equal(shapeScale.y, scale.y)
        assert.equal(shapeScale.z, scale.z)
        assert.equal(shape._collisionLayer, DefaultCollisionMask)
        assert.equal(shape._collisionMask, CollisionGroups.Default)
      }
      assert(hasComponent(entity, CollisionComponent))

      // clean up physx
      delete (globalThis as any).PhysX
    })

    it('trigger-volume', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world
      await Engine.currentWorld.physics.createScene({ verbose: true })

      const entity = createEntity()

      const randomVector3 = new Vector3().random()
      addComponent(entity, TransformComponent, {
        position: randomVector3.clone(),
        rotation: new Quaternion(),
        scale: new Vector3()
      })

      const target = MathUtils.generateUUID()

      const sceneComponentData = {
        target,
        onEnter: 'myEnter',
        onExit: 'myExit',
        showHelper: false
      }
      const sceneComponent: ComponentJson = {
        name: 'trigger-volume',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, TriggerVolumeComponent))
      assert.deepEqual(getComponent(entity, TriggerVolumeComponent), { ...sceneComponentData })
      assert.equal(getComponent(entity, TriggerVolumeComponent).target, target)
      assert(hasComponent(entity, ColliderComponent))
      assert(hasComponent(entity, CollisionComponent))

      // clean up physx
      delete (globalThis as any).PhysX
    })

    it('link', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world

      const entity = createEntity()

      const sceneComponentData = {
        href: 'https://google.com/'
      }
      const sceneComponent: ComponentJson = {
        name: 'link',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof Object3D)
      assert((getComponent(entity, Object3DComponent).value as any).href, 'https://google.com/')

      assert(hasComponent(entity, InteractableComponent))
      assert.deepStrictEqual(getComponent(entity, InteractableComponent), { action: 'link' })

      // clean up physx
      delete (globalThis as any).PhysX
    })

    // TODO: currently client only
    it.skip('particle-emitter', async () => { })
    it.skip('clouds', async () => { })
    it.skip('ocean', async () => { })
    it.skip('water', async () => { })
    it.skip('interior', async () => { })
    it.skip('postprocessing', async () => { })
    it.skip('cameraproperties', async () => { })
    it.skip('envmap', async () => { })
    it.skip('persist', async () => { })

    it('portal', async () => {

      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld = world
      await Engine.currentWorld.physics.createScene({ verbose: true })

      const entity = createEntity()

      const quat = new Quaternion().random()
      const triggerRotation = new Euler().setFromQuaternion(quat, 'XYZ')

      const randomVector3 = new Vector3().random()
      addComponent(entity, TransformComponent, {
        position: randomVector3.clone(),
        rotation: new Quaternion(),
        scale: new Vector3()
      })

      const linkedPortalId = MathUtils.generateUUID()

      const sceneComponentData = {
        modelUrl: '',
        locationName: 'test',
        linkedPortalId,
        displayText: 'Test',
        triggerPosition: { x: 1, y: 1, z: 1 },
        triggerRotation,
        triggerScale: { x: 1, y: 1, z: 1 }
      }
      const sceneComponent: ComponentJson = {
        name: 'portal',
        props: sceneComponentData
      }

      loadComponent(entity, sceneComponent)

      assert(hasComponent(entity, ColliderComponent))
      assert(hasComponent(entity, CollisionComponent))
      assert(hasComponent(entity, TriggerVolumeComponent))
      assert(hasComponent(entity, PortalComponent))

      // TODO: mesh only created on client
      const portalComponent = getComponent(entity, PortalComponent)
      assert.equal(portalComponent.location, 'test')
      assert.equal(portalComponent.linkedPortalId, linkedPortalId)
      assert.equal(portalComponent.displayText, 'Test')
      assert(Engine.currentWorld.portalQuery().includes(entity))

      // clean up physx
      delete (globalThis as any).PhysX
    })

    // TODO: currently client only
    it.skip('visible', async () => { })
  })
})
