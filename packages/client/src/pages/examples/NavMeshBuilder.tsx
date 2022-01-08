import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  addComponent,
  createMappedComponent,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import { createCellSpaceHelper } from '@xrengine/engine/src/navigation/CellSpacePartitioningHelper'
import { CustomVehicle } from '@xrengine/engine/src/navigation/CustomVehicle'
import { createConvexRegionHelper } from '@xrengine/engine/src/navigation/NavMeshHelper'
import { PathPlanner } from '@xrengine/engine/src/navigation/PathPlanner'
import { defineQuery } from 'bitecs'
import { MultiPolygon, Polygon, Position } from 'geojson'
import React, { useEffect } from 'react'
import {
  AmbientLight,
  BufferGeometry,
  ConeBufferGeometry,
  DirectionalLight,
  GridHelper,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three'
import { CellSpacePartitioning, EntityManager, FollowPathBehavior, Time } from 'yuka'

type NavigationComponentType = {
  pathPlanner: PathPlanner
  entityManager: EntityManager
  time: Time
  vehicles
  pathHelpers
  spatialIndexHelper
  regionHelper
  navigationMesh
}

const NavigationComponent = createMappedComponent<NavigationComponentType>('NavigationComponent')

const RenderSystem = async (world: World): Promise<System> => {
  return () => {
    Engine.renderer.render(Engine.scene, Engine.camera)
    return world
  }
}

const pathMaterial = new LineBasicMaterial({ color: 0xff0000 })
const vehicleMaterial = new MeshBasicMaterial({ color: 0xff0000 })
const vehicleGeometry = new ConeBufferGeometry(0.1, 0.5, 16)
vehicleGeometry.rotateX(Math.PI * 0.5)
vehicleGeometry.translate(0, 0.1, 0)
const vehicleCount = 1

const vehicleMesh = new InstancedMesh(vehicleGeometry, vehicleMaterial, vehicleCount)
// setup spatial index

const width = 100,
  height = 40,
  depth = 75
const cellsX = 100,
  cellsY = 1,
  cellsZ = 100

function scaleAndTranslatePosition(position: Position, llCenter: Position) {
  return [(position[0] - llCenter[0]) * 1000, (position[1] - llCenter[1]) * 1000]
}

function scaleAndTranslatePolygon(coords: Position[][], llCenter: Position) {
  return [coords[0].map((position) => scaleAndTranslatePosition(position, llCenter))]
}
function scaleAndTranslate(geometry: Polygon | MultiPolygon, llCenter: Position) {
  switch (geometry.type) {
    case 'MultiPolygon':
      geometry.coordinates = geometry.coordinates.map((coords) => scaleAndTranslatePolygon(coords, llCenter))
      break
    case 'Polygon':
      geometry.coordinates = scaleAndTranslatePolygon(geometry.coordinates, llCenter)
      break
  }

  return geometry
}

const loadNavMeshFromMapBox = async (navigationComponent) => {
  // const builder = new NavMeshBuilder()
  // const center = [-84.388, 33.749] as Position
  // const tiles = await fetchVectorTiles(center)
  // const gBuildings = tiles
  //   .reduce((acc, tiles) => acc.concat(tiles.building), [])
  //   .map((feature) => scaleAndTranslate(feature.geometry as Polygon | MultiPolygon, center as any))
  // const gGround = computeBoundingBox(gBuildings)
  // let gBuildingNegativeSpace = [gGround.coordinates]
  // gBuildings.forEach((gPositiveSpace) => {
  //   gBuildingNegativeSpace = pc.difference(gBuildingNegativeSpace as any, gPositiveSpace.coordinates as any)
  // })
  // builder.addGeometry({ type: 'MultiPolygon', coordinates: gBuildingNegativeSpace })
  // const navigationMesh = builder.build()
  // loadNavMesh(navigationMesh, navigationComponent)
}

const loadNavMesh = async (navigationMesh, navigationComponent) => {
  //       // visualize convex regions

  navigationComponent.regionHelper = createConvexRegionHelper(navigationMesh)
  navigationComponent.regionHelper.visible = true
  Engine.scene.add(navigationComponent.regionHelper)

  navigationComponent.pathPlanner = new PathPlanner(navigationMesh)

  navigationMesh.spatialIndex = new CellSpacePartitioning(width, height, depth, cellsX, cellsY, cellsZ)
  navigationMesh.updateSpatialIndex()
  navigationComponent.navigationMesh = navigationMesh

  navigationComponent.spatialIndexHelper = createCellSpaceHelper(navigationMesh.spatialIndex)
  Engine.scene.add(navigationComponent.spatialIndexHelper)
  navigationComponent.spatialIndexHelper.visible = false
}

async function startDemo(entity) {
  const navigationComponent = getComponent(entity, NavigationComponent)
  await loadNavMeshFromMapBox(navigationComponent)

  vehicleMesh.frustumCulled = false
  Engine.scene.add(vehicleMesh)

  for (let i = 0; i < vehicleCount; i++) {
    // path helper

    const pathHelper = new Line(new BufferGeometry(), pathMaterial)
    pathHelper.visible = false
    Engine.scene.add(pathHelper)
    navigationComponent.pathHelpers.push(pathHelper)

    // vehicle

    const vehicle = new CustomVehicle()
    vehicle.navMesh = navigationComponent.navigationMesh
    vehicle.maxSpeed = 1.5
    vehicle.maxForce = 10

    const toRegion = vehicle.navMesh.getRandomRegion()
    vehicle.position.copy(toRegion.centroid)
    vehicle.toRegion = toRegion

    const followPathBehavior = new FollowPathBehavior()
    followPathBehavior.nextWaypointDistance = 0.5
    followPathBehavior.active = false
    vehicle.steering.add(followPathBehavior)

    navigationComponent.entityManager.add(vehicle)
    navigationComponent.vehicles.push(vehicle)
  }
}

export const NavigationSystem = async (world: World): Promise<System> => {
  const entity = createEntity()
  addComponent(entity, NavigationComponent, {
    pathPlanner: new PathPlanner(),
    entityManager: new EntityManager(),
    time: new Time(),
    vehicles: [],
    pathHelpers: [],
    spatialIndexHelper: null,
    regionHelper: null,
    navigationMesh: null
  })
  startDemo(entity)

  const navigationQuery = defineQuery([NavigationComponent])

  return () => {
    const { delta } = world

    for (const entity of navigationQuery(world)) {
      const navComponent = getComponent(entity as Entity, NavigationComponent)

      navComponent.entityManager.update(delta)

      navComponent.pathPlanner.update()

      // Update pathfinding

      for (let i = 0, l = navComponent.vehicles.length; i < l; i++) {
        const vehicle = navComponent.vehicles[i]

        if (vehicle.currentRegion === vehicle.toRegion) {
          vehicle.fromRegion = vehicle.toRegion
          vehicle.toRegion = vehicle.navMesh.getRandomRegion()

          const from = vehicle.position
          const to = vehicle.toRegion.centroid

          navComponent.pathPlanner.findPath(vehicle, from, to, (vehicle, path) => {
            // update path helper

            const index = navComponent.vehicles.indexOf(vehicle)
            const pathHelper = navComponent.pathHelpers[index]

            pathHelper.geometry.dispose()
            pathHelper.geometry = new BufferGeometry().setFromPoints(path)

            // update path and steering

            const followPathBehavior = vehicle.steering.behaviors[0]
            followPathBehavior.active = true
            followPathBehavior.path.clear()

            for (const point of path) {
              followPathBehavior.path.add(point)
            }
          })
        }
      }

      // Update instancing
      for (let i = 0, l = navComponent.vehicles.length; i < l; i++) {
        const vehicle = navComponent.vehicles[i]
        vehicleMesh.setMatrixAt(i, vehicle.worldMatrix)
      }

      vehicleMesh.instanceMatrix.needsUpdate = true
    }
    return world
  }
}

// This is a functional React component
const Page = () => {
  useEffect(() => {
    ;(async function () {
      await initializeEngine()
      // Register our systems to do stuff
      registerSystem(SystemUpdateType.FIXED, Promise.resolve({ default: NavigationSystem }))
      registerSystem(SystemUpdateType.UPDATE, Promise.resolve({ default: RenderSystem }))
      await Engine.currentWorld.initSystems()

      // Set up rendering and basic scene for demo
      const canvas = document.createElement('canvas')
      document.body.appendChild(canvas) // adds the canvas to the body element

      let w = window.innerWidth,
        h = window.innerHeight

      let ctx = canvas.getContext('webgl2') as WebGLRenderingContext //, { alpha: false }
      Engine.renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true })

      Engine.renderer.setClearColor(0x3a3a3a, 1)
      Engine.renderer.setSize(w, h)

      Engine.scene = new Scene()
      Engine.scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444))

      Engine.camera = new PerspectiveCamera(45, w / h, 0.01, 1000)
      Engine.camera.position.set(2, 1, 5)
      Engine.camera.rotation.set(0, 0.3, 0)

      const controls = new OrbitControls(Engine.camera, canvas)
      controls.minDistance = 0.1
      controls.maxDistance = 10
      controls.target.set(0, 1.25, 0)
      controls.update()

      Engine.scene.add(Engine.camera)

      let light = new DirectionalLight(0xffffff, 1.0)
      light.position.set(4, 10, 1)
      Engine.scene.add(light)

      Engine.scene.add(new AmbientLight(0x404040))

      Engine.engineTimer.start()
    })()
  }, [])
  // Some JSX to keep the compiler from complaining
  return <section id="loading-screen"></section>
}

export default Page
