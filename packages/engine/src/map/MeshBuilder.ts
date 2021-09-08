import { Feature, Position } from 'geojson'
import { BufferGeometryLoader } from 'three'
import {
  MeshLambertMaterial,
  BufferGeometry,
  Mesh,
  BufferAttribute,
  CanvasTexture,
  Group,
  Object3D,
  PlaneGeometry,
  MeshLambertMaterialParameters
} from 'three'
import { unifyFeatures } from './GeoJSONFns'
import { NUMBER_OF_TILES_PER_DIMENSION, RASTER_TILE_SIZE_HDPI } from './MapBoxClient'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles, MAX_Z_INDEX } from './styles'
import { ILayerName, LongLat, TileFeaturesByLayer } from './types'
import { getRelativeSizesOfGeometries } from '../common/functions/GeometryFunctions'
import { METERS_PER_DEGREE_LL } from './constants'
import { collectFeaturesByLayer } from './util'
import { GeoLabelNode } from './GeoLabelNode'
import { PI } from '../common/constants/MathConstants'
import createGeometryWorker from './GeometryWorker'

const $workerMessagesByTaskId = new Map<
  string,
  {
    data: {
      geometry: {
        json: object
        transfer: {
          attributes: { [attributeName: string]: { array: Int32Array; itemSize: number; normalized: boolean } }
        }
      }
      geographicCenterPoint: LongLat
    }
  }
>()
const geometryWorker = createGeometryWorker({
  onmessage: (msg) => {
    $workerMessagesByTaskId.set(msg.data.taskId, msg)
  }
})

// TODO free resources used by canvases, bitmaps etc

export function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position, sceneScale = 1): Position {
  return [(lng - lngCenter) * METERS_PER_DEGREE_LL * sceneScale, (lat - latCenter) * METERS_PER_DEGREE_LL * sceneScale]
}

export function llToScene2([lng, lat]: Position, [lngCenter, latCenter]: Position, scale = 1): Position {
  const x = (lng - lngCenter) * 111134.861111 * scale
  const z = (lat - latCenter) * (Math.cos((latCenter * PI) / 180) * 111321.377778) * scale
  return [x, z]
}

export function sceneToLl(position: Position, [lngCenter, latCenter] = [0, 0] as LongLat, scale = 1): Position {
  const longtitude = position[0] / (111134.861111 * scale) + lngCenter
  const latitude = -position[1] / (Math.cos((latCenter * PI) / 180) * 111321.377778 * scale) + latCenter
  return [longtitude, latitude]
}

const $geometriesByTaskId = new Map<string, { geometry: BufferGeometry; geographicCenterPoint: LongLat }>()
const $meshesByTaskId = new Map<string, { mesh: Mesh; geographicCenterPoint: LongLat }>()
const $labelsByTaskId = new Map<string, GeoLabelNode>()

const geometryLoader = new BufferGeometryLoader()
function buildGeometry(taskId: string, layerName: ILayerName, feature: Feature, llCenter: LongLat): Promise<void> {
  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const promise = new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      const msg = $workerMessagesByTaskId.get(taskId)
      if (msg) {
        clearInterval(interval)
        const {
          geometry: { json, transfer },
          geographicCenterPoint
        } = msg.data
        const geometry = geometryLoader.parse(json)
        for (const attributeName in transfer.attributes) {
          const { array, itemSize, normalized } = transfer.attributes[attributeName]
          geometry.setAttribute(attributeName, new BufferAttribute(array, itemSize, normalized))
        }
        $geometriesByTaskId.set(taskId, { geometry, geographicCenterPoint })
        $workerMessagesByTaskId.delete(taskId)
        resolve()
      }
    }, 200)
  })
  geometryWorker.postMessage({ taskId: taskId, style, feature, llCenter })
  return promise
}

function createCanvasRenderingContext2D(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d')
}

function generateRasterTileCanvas(rasterTiles: ImageBitmap[]) {
  const size = RASTER_TILE_SIZE_HDPI * NUMBER_OF_TILES_PER_DIMENSION
  const context = createCanvasRenderingContext2D(size, size)

  for (let tileY = 0; tileY < NUMBER_OF_TILES_PER_DIMENSION; tileY++) {
    for (let tileX = 0; tileX < NUMBER_OF_TILES_PER_DIMENSION; tileX++) {
      const tileIndex = tileY * NUMBER_OF_TILES_PER_DIMENSION + tileX
      context.drawImage(rasterTiles[tileIndex], tileX * RASTER_TILE_SIZE_HDPI, tileY * RASTER_TILE_SIZE_HDPI)
    }
  }

  return context.canvas
}

const materialsByParams = new Map<MeshLambertMaterialParameters, MeshLambertMaterial>()

function getOrCreateMaterial(Material: any, params: MeshLambertMaterialParameters): MeshLambertMaterial {
  let material: any

  if (!materialsByParams.get(params)) {
    material = new Material(params)
    materialsByParams.set(params, material)
  } else {
    material = materialsByParams.get(params)
  }

  return material
}

/**
 * TODO adapt code from https://raw.githubusercontent.com/jeromeetienne/threex.proceduralcity/master/threex.proceduralcity.js
 */
export function buildMeshes(layerName: ILayerName, features: Feature[], llCenter: Position) {
  const pendingTasks: { id: string; featureIndex: number }[] = []
  const promises = []
  features.forEach((feature, featureIndex) => {
    const id = feature.properties.uuid
    promises.push(buildGeometry(id, layerName, feature, llCenter))
    // Don't rebuild it if already available
    if (!$meshesByTaskId.has(id)) {
      pendingTasks.push({
        id: feature.properties.uuid,
        featureIndex
      })
    }
  })

  return {
    tasks: pendingTasks,
    promise: Promise.all(promises).then(() => {
      for (const task of pendingTasks) {
        const result = $geometriesByTaskId.get(task.id)
        // Tasks can be cancelled mid-run if deleteResultsForFeature has been called
        if (result) {
          const styles = getFeatureStyles(
            DEFAULT_FEATURE_STYLES,
            layerName,
            features[task.featureIndex].properties.class
          )

          const materialParams = {
            color: styles.color?.constant,
            vertexColors: styles.color?.builtin_function === 'purple_haze' ? true : false,
            depthTest: styles.extrude !== 'flat'
          }

          const material = getOrCreateMaterial(MeshLambertMaterial, materialParams)
          const mesh = new Mesh(result.geometry, material)
          mesh.renderOrder = styles.extrude === 'flat' ? -1 * (MAX_Z_INDEX - styles.zIndex) : Infinity
          $meshesByTaskId.set(task.id, { mesh, geographicCenterPoint: result.geographicCenterPoint })
        } else {
          // TODO how to handle this situation?
          console.warn(`buildMeshes: Task ${task.id} was cancelled mid-run`)
        }
      }
    })
  }
}

export function getValidUUIDs() {
  return $meshesByTaskId.keys()
}

export function getResultsForFeature(featureUUID: string) {
  return {
    mesh: $meshesByTaskId.get(featureUUID),
    label: $labelsByTaskId.get(featureUUID)
  }
}

export function deleteResultsForFeature(featureUUID: string) {
  $workerMessagesByTaskId.delete(featureUUID)
  $geometriesByTaskId.delete(featureUUID)
  $meshesByTaskId.delete(featureUUID)
  $labelsByTaskId.delete(featureUUID)
}

export function createGroundMesh(rasterTiles: ImageBitmap[], latitude: number): Mesh {
  const sizeInPx = NUMBER_OF_TILES_PER_DIMENSION * RASTER_TILE_SIZE_HDPI
  // Will be scaled according to building mesh
  const geometry = new PlaneGeometry(1, 1)
  const texture = rasterTiles.length > 0 ? new CanvasTexture(generateRasterTileCanvas(rasterTiles)) : null

  const material = getOrCreateMaterial(
    MeshLambertMaterial,
    texture
      ? {
          map: texture
        }
      : {
          color: 0x433d13
        }
  )
  const mesh = new Mesh(geometry, material)

  // prevent z-fighting with vector roads
  material.depthTest = false
  mesh.renderOrder = -1 * MAX_Z_INDEX

  // rotate to face up
  mesh.geometry.rotateX(-Math.PI / 2)

  // TODO why do the vector tiles and the raster tiles not line up?
  mesh.position.x -= 80
  mesh.position.z -= 50

  return mesh
}

export async function createBuildings(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  const features = unifyFeatures(collectFeaturesByLayer('building', vectorTiles))
  const { promise, tasks } = buildMeshes('building', features, llCenter)

  await promise

  const group = new Group()
  for (const { id } of tasks) {
    group.add($meshesByTaskId.get(id)?.mesh)
  }

  return group
}

async function createLayerGroup(
  layers: ILayerName[],
  vectorTiles: TileFeaturesByLayer[],
  llCenter: Position
): Promise<Group> {
  const promises = []
  let allTasks = []
  layers.forEach((layerName) => {
    const featuresInLayer = collectFeaturesByLayer(layerName, vectorTiles)

    const { promise, tasks } = buildMeshes(layerName, featuresInLayer, llCenter)
    promises.push(promise)
    allTasks = allTasks.concat(tasks)
  })
  const group = new Group()

  await Promise.all(promises)

  for (const { id } of allTasks) {
    group.add($meshesByTaskId.get(id)?.mesh)
  }
  return group
}

export function createRoads(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  return createLayerGroup(['road'], vectorTiles, llCenter)
}

export function createWater(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  return createLayerGroup(['water', 'waterway'], vectorTiles, llCenter)
}

export function createLabels(vectorTiles: TileFeaturesByLayer[]): GeoLabelNode[] {
  const features = collectFeaturesByLayer('road', vectorTiles)
  return features.reduce((acc, f: Feature) => {
    if (f.properties.name && ['LineString'].indexOf(f.geometry.type) >= 0) {
      const labelView = new GeoLabelNode(f as any)

      acc.push(labelView)
      $labelsByTaskId.set(f.properties.uuid, labelView)
    }
    return acc
  }, [])
}

export function createLandUse(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  return createLayerGroup(['landuse'], vectorTiles, llCenter)
}

/** Workaround for until we get the Web Mercator projection math right so that the ground and building meshes line up */
export function setGroundScaleAndPosition(groundMesh: Mesh, buildingMesh: Mesh) {
  const scaleX = getRelativeSizesOfGeometries(groundMesh.geometry, buildingMesh.geometry, 'x')
  const scaleZ = getRelativeSizesOfGeometries(groundMesh.geometry, buildingMesh.geometry, 'z')
  groundMesh.scale.x = scaleX
  groundMesh.scale.z = scaleZ
  buildingMesh.geometry.boundingBox.getCenter(groundMesh.position)
  groundMesh.position.y = 0
}

export function safelySetGroundScaleAndPosition(ground: Object3D | undefined, building: Object3D | undefined) {
  if (ground?.type === 'Mesh' && building?.type === 'Mesh') {
    setGroundScaleAndPosition(ground as Mesh, building as Mesh)
  } else {
    console.warn('safelySetGroundScaleAndPosition: both ground and building mush be Meshes!')
  }
}
