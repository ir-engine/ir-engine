import { buffer, centerOfMass } from '@turf/turf'
import { Feature, Geometry, Position } from 'geojson'
import { BufferGeometryLoader, MeshBasicMaterial } from 'three'
import {
  MeshLambertMaterial,
  BufferGeometry,
  Mesh,
  Shape,
  ShapeGeometry,
  ExtrudeGeometry,
  BufferAttribute,
  Color,
  CanvasTexture,
  Group,
  Object3D,
  Vector3,
  PlaneGeometry,
  MeshLambertMaterialParameters
} from 'three'
import { mergeBufferGeometries } from '../common/classes/BufferGeometryUtils'
import { unifyFeatures } from './GeoJSONFns'
import { NUMBER_OF_TILES_PER_DIMENSION, RASTER_TILE_SIZE_HDPI } from './MapBoxClient'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles, IStyles, MAX_Z_INDEX } from './styles'
import { toIndexed } from './toIndexed'
import { ILayerName, LongLat, TileFeaturesByLayer } from './types'
import { getRelativeSizesOfGeometries } from '../common/functions/GeometryFunctions'
import { METERS_PER_DEGREE_LL } from './constants'
import { collectFeaturesByLayer } from './util'
import { GeoLabelNode } from './GeoLabelNode'
import { PI } from '../common/constants/MathConstants'
import convertFunctionToWorker from '@xrengine/common/src/utils/convertFunctionToWorker'
import { isClient } from '../common/functions/isClient'
import { flatten } from 'lodash'

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

function importScripts(...urls: string[]) {
  void urls
}

const geometryWorkerFunction = function () {
  // TODO figure out how to use our own bundle
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
  // importScripts('https://cdnjs.cloudflare.com/ajax/libs/Turf.js/0.0.124/turf.min.js')
  importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/turf.min.js')

  const { Vector3, Shape, ShapeGeometry, ExtrudeGeometry, Color, BufferAttribute, BufferGeometry } =
    /* @ts-ignore:next-line */
    this.THREE as typeof THREE

  const turf = this.turf

  const messageQueue = []
  let processingQueue = false

  this.onmessage = function (msg) {
    // console.log('adding task', msg.data.taskId, 'to Queue')
    messageQueue.push(msg)
  }

  setInterval(() => {
    if (processingQueue && messageQueue.length > 0) return

    processingQueue = true
    // console.log('processing Queue begin', messageQueue.length, 'items')
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift()
      const { taskId, style, feature, llCenter } = msg.data
      const geometry = build(feature, llCenter, style)

      const bufferGeometry = new BufferGeometry().copy(geometry)

      const arrayBuffers = []
      const attributes = {}
      for (let attributeName of Object.keys(bufferGeometry.attributes)) {
        const attribute = bufferGeometry.getAttribute(attributeName)
        const array = attribute.array as Float32Array
        arrayBuffers.push(array.buffer)
        attributes[attributeName] = {
          array,
          itemSize: attribute.itemSize,
          normalized: attribute.normalized
        }
      }

      postMessage({ taskId, json: bufferGeometry.toJSON(), transfer: { attributes } }, arrayBuffers as any)
    }
    processingQueue = false
  }, 200)

  const $vector3 = new Vector3()
  const METERS_PER_DEGREE_LL = 111139

  function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position, sceneScale = 1): Position {
    return [
      (lng - lngCenter) * METERS_PER_DEGREE_LL * sceneScale,
      (lat - latCenter) * METERS_PER_DEGREE_LL * sceneScale
    ]
  }

  // TODO integrate with ./styles.ts
  const baseColorByFeatureType = {
    university: 0xf5e0a0,
    school: 0xffd4be,
    apartments: 0xd1a1d1,
    parking: 0xa0a7af,
    civic: 0xe0e0e0,
    commercial: 0x8fb0d8,
    retail: 0xd8d8b2
  }

  function getBuildingColor(feature: Feature) {
    const specialColor = baseColorByFeatureType[feature.properties.type]
    return new Color(specialColor || 0xcacaca)
  }

  function colorVertices(geometry: BufferGeometry, baseColor: Color, light: Color, shadow: Color) {
    const normals = geometry.attributes.normal
    const topColor = baseColor.clone().multiply(light)
    const bottomColor = baseColor.clone().multiply(shadow)

    geometry.setAttribute('color', new BufferAttribute(new Float32Array(normals.count * 3), 3))

    const colors = geometry.attributes.color

    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.boundingBox.getSize($vector3)
    const alpha = 1 - Math.min(1, $vector3.y / 200)
    const lerpedTopColor = topColor.lerp(bottomColor, alpha)

    for (let i = 0; i < normals.count; i++) {
      const color = normals.getY(i) === 1 ? lerpedTopColor : bottomColor
      colors.setXYZ(i, color.r, color.g, color.b)
    }
  }

  function build(feature: Feature, llCenter: Position, style: IStyles): BufferGeometry | null {
    const shape = new Shape()

    const { geometry } =
      feature.geometry.type === 'LineString' ||
      feature.geometry.type === 'Point' ||
      feature.geometry.type === 'MultiLineString'
        ? turf.buffer(feature, style.width || 1, {
            units: 'meters'
          })
        : feature

    let coords: Position[]

    // TODO switch statement
    if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates[0][0] // TODO: add all multipolygon coords.
    } else if (geometry.type === 'Polygon') {
      coords = geometry.coordinates[0] // TODO: handle interior rings
    } else if (geometry.type === 'MultiPoint') {
      // TODO is this a bug?
      coords = geometry.coordinates[0] as any
    } else {
      // TODO handle feature.geometry.type === 'GeometryCollection'?
    }

    var point = llToScene(coords[0], llCenter)
    shape.moveTo(point[0], point[1])

    coords.slice(1).forEach((coord: Position) => {
      point = llToScene(coord, llCenter)
      shape.lineTo(point[0], point[1])
    })
    point = llToScene(coords[0], llCenter)
    shape.lineTo(point[0], point[1])

    let height: number

    // TODO handle min_height
    if (style.height === 'a') {
      if (feature.properties.height) {
        height = feature.properties.height
      } else if (feature.properties.render_height) {
        height = feature.properties.render_height
      } else if (feature.properties.area) {
        height = Math.sqrt(feature.properties.area)
      } else {
        // ignore standalone building labels.
        console.warn('just a label.', feature.properties)
        return null
      }
      height *= style.height_scale || 1
    } else {
      height = style.height || 4
    }

    let threejsGeometry: BufferGeometry | null = null

    if (style.extrude === 'flat') {
      threejsGeometry = new ShapeGeometry(shape)
    } else if (style.extrude === 'rounded') {
      threejsGeometry = new ExtrudeGeometry(shape, {
        steps: 1,
        depth: height || 1,
        bevelEnabled: true,
        bevelThickness: 8,
        bevelSize: 16,
        bevelSegments: 16
      })
    } else {
      threejsGeometry = new ExtrudeGeometry(shape, {
        steps: 1,
        depth: height || 1,
        bevelEnabled: false
      })
    }

    if (threejsGeometry) {
      threejsGeometry.rotateX(-Math.PI / 2)
    }

    if (style.color && style.color.builtin_function === 'purple_haze') {
      const light = new Color(0xa0c0a0)
      const shadow = new Color(0x303050)
      colorVertices(threejsGeometry, getBuildingColor(feature), light, feature.properties.extrude ? shadow : light)
    }

    return threejsGeometry
  }
}

const geometryWorker = isClient ? convertFunctionToWorker(geometryWorkerFunction) : null

const $workerMessagesByTaskId = []
const $geometriesByTaskId = []

geometryWorker.onmessage = (msg) => {
  $workerMessagesByTaskId[msg.data.taskId] = msg
}

const geometryLoader = new BufferGeometryLoader()
function buildGeometry(taskId: number, layerName: ILayerName, feature: Feature, llCenter: LongLat): Promise<void> {
  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const promise = new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      const msg = $workerMessagesByTaskId[taskId]
      if (msg) {
        const { json, transfer } = msg.data
        const geometry = geometryLoader.parse(json)
        for (const attributeName in transfer.attributes) {
          const { array, itemSize, normalized } = transfer.attributes[attributeName]
          geometry.setAttribute(attributeName, new BufferAttribute(array, itemSize, normalized))
        }
        $geometriesByTaskId[taskId] = geometry
        clearInterval(interval)
        delete $workerMessagesByTaskId[taskId]
        $workerMessagesByTaskId[taskId] = null
        resolve()
      }
    }, 100)
  })
  geometryWorker.postMessage({ taskId, style, feature, llCenter })
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

let $taskId = 0
const $meshesByTaskId = []

/**
 * TODO adapt code from https://raw.githubusercontent.com/jeromeetienne/threex.proceduralcity/master/threex.proceduralcity.js
 */
export function buildMeshes(
  layerName: ILayerName,
  features: Feature[],
  llCenter: Position
): {
  tasks: { id: number; featureIndex: number }[]
  promise: Promise<void>
} {
  const pendingTasks = []
  const promises = []
  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    promises.push(buildGeometry($taskId, layerName, features[featureIndex], llCenter))
    pendingTasks.push({
      id: $taskId,
      featureIndex
    })
    $taskId++
  }

  return {
    tasks: pendingTasks,
    promise: Promise.all(promises).then(() => {
      for (const task of pendingTasks) {
        const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, features[task.featureIndex].properties.class)

        const materialParams = {
          color: styles.color?.constant,
          vertexColors: styles.color?.builtin_function === 'purple_haze' ? true : false,
          depthTest: styles.extrude !== 'flat'
        }

        const material = getOrCreateMaterial(MeshLambertMaterial, materialParams)
        const mesh = new Mesh($geometriesByTaskId[task.id], material)
        mesh.renderOrder = styles.extrude === 'flat' ? -1 * (MAX_Z_INDEX - styles.zIndex) : Infinity
        $meshesByTaskId[task.id] = mesh
      }
    })
  }
}

export function resetQueues() {
  $taskId = 0
  $geometriesByTaskId.length = 0
  $meshesByTaskId.length = 0
}

export function getResultsQueue(): readonly Mesh[] {
  return $meshesByTaskId
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
    group.add($meshesByTaskId[id])
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
    group.add($meshesByTaskId[id])
  }
  return group
}

export function createRoads(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  return createLayerGroup(['road'], vectorTiles, llCenter)
}

export function createWater(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Promise<Group> {
  return createLayerGroup(['water', 'waterway'], vectorTiles, llCenter)
}

export function createLabels(vectorTiles: TileFeaturesByLayer[], llCenter: Position): GeoLabelNode[] {
  const features = collectFeaturesByLayer('road', vectorTiles)
  return features.reduce((acc, f: any) => {
    if (f.properties.name && ['LineString'].indexOf(f.geometry.type) >= 0) {
      const labelView = new GeoLabelNode(f, (pos: Position) => llToScene(pos, llCenter))

      acc.push(labelView)
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
