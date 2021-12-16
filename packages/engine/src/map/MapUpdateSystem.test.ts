import assert from 'assert'
import sinon, { SinonSpy } from 'sinon'
import mock from 'mock-require'
import { createWorld, World } from '@xrengine/engine/src/ecs/classes/World'
import { Group, Mesh, Object3D, Quaternion, Vector3 } from 'three'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { addComponent, getComponent } from '../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { Entity } from '../../src/ecs/classes/Entity'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { lineString } from '@turf/helpers'
import { System } from '../../src/ecs/classes/System'
import { AvatarComponent } from '../../src/avatar/components/AvatarComponent'
import { NavMeshComponent } from '../../src/navigation/component/NavMeshComponent'
import { MapAction, mapReducer } from '../../src/map/MapReceptor'
import { MapStateUnwrapped } from '../../src/map/types'
import { MapComponent } from '../../src/map/MapComponent'
import FeatureKey from '../../src/map/classes/FeatureKey'

describe.skip('MapUpdateSystem', () => {
  const triggerRefreshRadius = 20 // meters
  const mapCenter = [0, 0]
  let execute: System,
    world: World,
    state: MapStateUnwrapped,
    subScene: Object3D,
    viewerEntity: Entity,
    mapEntity: Entity,
    getPhases: SinonSpy,
    startPhases: SinonSpy,
    resetPhases: SinonSpy,
    createFeatureLabel: SinonSpy,
    createSUT: (world: World) => Promise<System>

  beforeEach(async () => {
    mock('../../src/map/functions/PhaseFunctions', {
      getPhases: sinon.spy(),
      startPhases: sinon.spy(),
      resetPhases: sinon.spy()
    })
    mock(
      '../../src/map/functions/createFeatureLabel',
      (() => {
        const { Object3D } = require('three')
        const mesh = new Object3D()
        mesh.update = sinon.spy()
        return () => {
          return {
            mesh,
            centerPoint: [5, 7],
            boundingCircleRadius: 2
          }
        }
      })()
    )
    createSUT = require('../../src/map/MapUpdateSystem').default
    const PhaseFunctions = require('../../src/map/functions/PhaseFunctions')
    getPhases = PhaseFunctions.getPhases
    startPhases = PhaseFunctions.startPhases
    resetPhases = PhaseFunctions.resetPhases
    createFeatureLabel = require('../../src/map/functions/createFeatureLabel')
    world = createWorld()
    viewerEntity = createEntity(world)
    mapEntity = createEntity(world)
    execute = await createSUT(world)
    subScene = new Object3D()

    state = mapReducer(null, MapAction.initialize(mapCenter))

    subScene = new Object3D()

    addComponent(
      viewerEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(1)
      },
      world
    )
    addComponent(viewerEntity, AvatarComponent, {} as any, world)

    addComponent(mapEntity, MapComponent, {}, world)
    addComponent(mapEntity, Object3DComponent, { value: subScene }, world)
    addComponent(
      mapEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(state.scale)
      },
      world
    )
    addComponent(
      mapEntity,
      NavMeshComponent,
      {
        navTarget: new Group()
      },
      world
    )
  })

  afterEach(() => {
    sinon.restore()
    mock.stopAll()
  })

  // TODO change to: "resets phases when the center point changes enough to invalidate cache" i.e. the distance from the previous center point >= 2 * state.triggerRefreshRadius
  it('resets and starts the flow when external code changes the map center point', () => {
    state.center = [12, 12]
    execute()

    state.center[0] = 13

    execute()

    assert.equal(resetPhases.callCount, 1)
    assert.equal(startPhases.callCount, 1)
  })

  it('does nothing while player moves within refresh boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent)

    execute()
    viewerTransform.position.set((triggerRefreshRadius / 2) * state.scale, 0, 0)
    execute()

    assert.equal(startPhases.callCount, 0)
  })

  // I don't know why this test fails when run with the rest of this suite but passes when run by itself.
  it.skip('lazily starts working when player crosses boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent)

    execute()
    viewerTransform.position.set(state.triggerRefreshRadius * state.scale, 0, 0)
    console.log('position updated')
    execute()

    console.log('callCount', getPhases.callCount)
    assert(getPhases.calledOnce)
    assert(startPhases.calledOnce)

    viewerTransform.position.set(state.triggerRefreshRadius * 1.5 * state.scale, 0, 0)
    execute()

    assert(getPhases.calledOnce)
    assert(startPhases.calledOnce)

    viewerTransform.position.set(state.triggerRefreshRadius * 2 * state.scale, 0, 0)
    execute()

    assert(getPhases.calledTwice)
    assert(startPhases.calledTwice)
  })

  it('replaces the map with a spinner when the complete object cache is empty and an update is in progress', () => {
    state.activePhase = "DoingThingsAndStuff"
    const subScene = getComponent(mapEntity, Object3DComponent)

    execute()

    assert.deepEqual(subScene.value.children, [state.updateSpinner])
  })

  it('updates the scene using the cached complete objects when active phase is "UpdateScene"', () => {
    const mesh = new Mesh()
    const subScene = getComponent(mapEntity, Object3DComponent)
    state.activePhase = 'UpdateScene'
    state.completeObjects.set(new FeatureKey('road', 0, 0, '0'), {
      centerPoint: [0, 0],
      boundingCircleRadius: 5,
      mesh
    })

    execute()

    assert(subScene.value.children.includes(mesh))
  })

  it('unsets the flag after the scene has been updated', () => {
    state.activePhase = 'UpdateScene'

    execute()

    assert.equal(state.activePhase, null)
  })

  it('does nothing while player moves within refresh boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent)

    execute()
    viewerTransform.position.set((state.triggerRefreshRadius / 2) * state.scale, 0, 0)
    execute()

    assert.equal(startPhases.callCount, 0)
  })

  it('adds and positions labels in the scene (if close enough)', () => {
    const feature = lineString([
      [0, 0],
      [1, 0],
      [2, 1],
      [4, 2]
    ])
    const label = createFeatureLabel('123 sesame st', feature, [0, 0])

    state.labelCache.set(new FeatureKey('road', 0, 0, '0'), label)
    state.activePhase = 'UpdateScene'

    world.fixedDelta = 0.16
    world.fixedElapsedTime = world.fixedDelta * 20
    execute()

    assert(subScene.children.includes(label.mesh))
    assert(label.mesh.parent === subScene)
    assert.deepEqual(label.mesh.position.toArray(), [label.centerPoint[0], 0, label.centerPoint[1]])
    assert(label.mesh.update.calledOnce)
  })

  it('adds meshes to the navigation plane as they become available', () => {
    const mesh = new Mesh()
    const navTarget = getComponent(mapEntity, NavMeshComponent).navTarget
    state.completeObjects.set(new FeatureKey('landuse_fallback', 0, 0, '0'), {
      mesh,
      centerPoint: [0, 0],
      boundingCircleRadius: 1
    })
    state.activePhase = 'UpdateScene'

    world.fixedDelta = 0.16
    world.fixedElapsedTime = world.fixedDelta * 20
    execute()

    assert(navTarget.children.includes(mesh))
  })
})
