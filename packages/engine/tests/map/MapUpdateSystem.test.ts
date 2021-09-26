import assert from 'assert'
import sinon, {SinonSpy} from 'sinon'
import mock from 'mock-require'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Mesh, Object3D, Quaternion, Vector3 } from 'three'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { addComponent, getComponent } from '../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import { Entity } from '../../src/ecs/classes/Entity'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { FollowCameraComponent } from '../../src/camera/components/FollowCameraComponent'
import { createWorld } from '../../src/ecs/functions/EngineFunctions'
import createStore from '../../src/map/functions/createStore'
import { lineString } from '@turf/helpers'
import { System } from '../../src/ecs/classes/System'


describe('MapUpdateSystem', () => {
  const triggerRefreshRadius = 20 // meters
  const minimumSceneRadius = triggerRefreshRadius * 2
  const mapScale = 0.5
  const mapArgs = {}
  const mapCenter = [0, 0]
  let world: World,
    execute: System,
    viewerEntity: Entity,
    mapEntity: Entity,
    store: ReturnType<typeof createStore>,
    subScene: Object3D,
    actuateLazy: SinonSpy,
    getPhases: SinonSpy,
    createFeatureLabel: SinonSpy,
    createSUT: (world: World) => Promise<System>

  beforeEach(async () => {

    mock('../../src/map/functions/actuateLazy', sinon.spy())
    mock('../../src/map/functions/getPhases', sinon.spy())
    mock('../../src/map/functions/createFeatureLabel', (() => {
      const { Object3D } = require('three')
      const mesh = new Object3D()
      mesh.update = sinon.spy()
      return () => ({
        mesh,
        centerPoint: [5, 7],
        boundingCircleRadius: 2
      })
    })())
    createSUT = require('../../src/map/MapUpdateSystem').default
    actuateLazy = require('../../src/map/functions/actuateLazy')
    getPhases = require('../../src/map/functions/getPhases')
    createFeatureLabel = require('../../src/map/functions/createFeatureLabel')
    world = createWorld()
    viewerEntity = createEntity(world)
    mapEntity = createEntity(world)
    execute = await createSUT(world)
    store = createStore(mapCenter, [0, 0], triggerRefreshRadius, minimumSceneRadius, mapScale, mapArgs)
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
    addComponent(viewerEntity, FollowCameraComponent, null, world)

    addComponent(mapEntity, MapComponent, store, world)
    addComponent(mapEntity, Object3DComponent, { value: subScene }, world)
    addComponent(
      mapEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(mapScale)
      },
      world
    )
  })

  beforeEach(() => {
    sinon.restore()
  })

  it('does nothing while player moves within refresh boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    execute()
    viewerTransform.position.set((triggerRefreshRadius / 2) * mapScale, 0, 0)
    execute()

    assert.equal(actuateLazy.callCount, 0)
  })

  it('lazily starts working when player crosses boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    execute()
    viewerTransform.position.set(triggerRefreshRadius * mapScale, 0, 0)
    execute()

    assert(getPhases.calledOnce)
    assert(actuateLazy.calledOnce)

    viewerTransform.position.set(triggerRefreshRadius * 1.5 * mapScale, 0, 0)
    execute()

    assert(getPhases.calledOnce)
    assert(actuateLazy.calledOnce)

    viewerTransform.position.set(triggerRefreshRadius * 2 * mapScale, 0, 0)
    execute()

    assert(getPhases.calledTwice)
    assert(actuateLazy.calledTwice)
  })

  it('adds and positions labels in the scene (if close enough)', () => {
    const feature = lineString([
      [0, 0],
      [1, 0],
      [2, 1],
      [4, 2]
    ])
    feature.properties.name = "don't panic"
    const label = createFeatureLabel(feature, [0, 0])

    store.labelCache.set(['road', 0, 0, '0'], label)

    world.fixedElapsedTime = world.fixedDelta * 20
    execute()

    assert(subScene.children.includes(label.mesh))
    assert(label.mesh.parent === subScene)
    assert.deepEqual(label.mesh.position.toArray(), [label.centerPoint[0], 0, label.centerPoint[1]])
    assert(label.mesh.update.calledOnce)
  })
})
