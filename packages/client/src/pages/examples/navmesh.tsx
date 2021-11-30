import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  createMappedComponent,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import { createCellSpaceHelper } from '@xrengine/engine/src/navigation/CellSpacePartitioningHelper'
import { CustomVehicle } from '@xrengine/engine/src/navigation/CustomVehicle'
import { createConvexRegionHelper } from '@xrengine/engine/src/navigation/NavMeshHelper'
import { PathPlanner } from '@xrengine/engine/src/navigation/PathPlanner'
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
import { CellSpacePartitioning, EntityManager, FollowPathBehavior, NavMeshLoader, Time } from 'yuka'
import { defineQuery } from 'bitecs'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'

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
    useEngine().renderer.render(useEngine().scene, useEngine().camera)
  }
}

const pathMaterial = new LineBasicMaterial({ color: 0xff0000 })
const vehicleMaterial = new MeshBasicMaterial({ color: 0xff0000 })
const vehicleGeometry = new ConeBufferGeometry(0.1, 0.5, 16)
vehicleGeometry.rotateX(Math.PI * 0.5)
vehicleGeometry.translate(0, 0.1, 0)
const vehicleCount = 100

const vehicleMesh = new InstancedMesh(vehicleGeometry, vehicleMaterial, vehicleCount)
// setup spatial index

const width = 100,
  height = 40,
  depth = 75
const cellsX = 20,
  cellsY = 5,
  cellsZ = 20

const meshUrl = '/models/navmesh/navmesh.glb'

const loadNavMeshFromUrl = async (meshurl, navigationComponent) => {
  const navigationMesh = await new NavMeshLoader().load(meshurl)
  loadNavMesh(navigationMesh, navigationComponent)
}

const loadNavMesh = async (navigationMesh, navigationComponent) => {
  //       // visualize convex regions

  navigationComponent.regionHelper = createConvexRegionHelper(navigationMesh)
  navigationComponent.regionHelper.visible = true
  useEngine().scene.add(navigationComponent.regionHelper)

  navigationComponent.pathPlanner = new PathPlanner(navigationMesh)

  navigationMesh.spatialIndex = new CellSpacePartitioning(width, height, depth, cellsX, cellsY, cellsZ)
  navigationMesh.updateSpatialIndex()
  navigationComponent.navigationMesh = navigationMesh

  navigationComponent.spatialIndexHelper = createCellSpaceHelper(navigationMesh.spatialIndex)
  useEngine().scene.add(navigationComponent.spatialIndexHelper)
  navigationComponent.spatialIndexHelper.visible = false
}

async function startDemo(entity) {
  const navigationComponent = getComponent(entity, NavigationComponent)
  await loadNavMeshFromUrl(meshUrl, navigationComponent)

  vehicleMesh.frustumCulled = false
  useEngine().scene.add(vehicleMesh)

  for (let i = 0; i < vehicleCount; i++) {
    // path helper

    const pathHelper = new Line(new BufferGeometry(), pathMaterial)
    pathHelper.visible = false
    useEngine().scene.add(pathHelper)
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
      const navComponent = getComponent(entity, NavigationComponent)

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
  }
}

// This is a functional React component
const Page = () => {
  useEffect(() => {
    ;(async function () {
      // Register our systems to do stuff

      await initializeEngine()
      registerSystem(SystemUpdateType.FIXED, Promise.resolve({ default: NavigationSystem }))
      registerSystem(SystemUpdateType.UPDATE, Promise.resolve({ default: RenderSystem }))
      await useEngine().defaultWorld.initSystems()

      // Set up rendering and basic scene for demo
      const canvas = document.createElement('canvas')
      document.body.appendChild(canvas) // adds the canvas to the body element

      let w = window.innerWidth,
        h = window.innerHeight

      let ctx = canvas.getContext('webgl2') as WebGLRenderingContext //, { alpha: false }
      useEngine().renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true })

      useEngine().renderer.setClearColor(0x3a3a3a, 1)
      useEngine().renderer.setSize(w, h)

      useEngine().scene = new Scene()
      useEngine().scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444))

      useEngine().camera = new PerspectiveCamera(45, w / h, 0.01, 1000)
      useEngine().camera.position.set(2, 1, 5)
      useEngine().camera.rotation.set(0, 0.3, 0)

      const controls = new OrbitControls(useEngine().camera, canvas)
      controls.minDistance = 0.1
      controls.maxDistance = 10
      controls.target.set(0, 1.25, 0)
      controls.update()

      useEngine().scene.add(useEngine().camera)

      let light = new DirectionalLight(0xffffff, 1.0)
      light.position.set(4, 10, 1)
      useEngine().scene.add(light)

      useEngine().scene.add(new AmbientLight(0x404040))

      useEngine().engineTimer.start()
    })()
  }, [])
  // Some JSX to keep the compiler from complaining
  return <section id="loading-screen"></section>
}

export default Page
