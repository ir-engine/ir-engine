import { buffer, centerOfMass } from '@turf/turf'
import { Feature, Geometry, Position } from 'geojson'
import { MeshBasicMaterial } from 'three'
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
import resolve from 'resolve'

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

function geometryWorkerFunction() {
  // TODO figure out how to use our own bundle
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')

  /* @ts-ignore:next-line */
  const { Shape, ShapeGeometry, ExtrudeGeometry, Color } = this.THREE as typeof THREE

  this.onmessage = function (msg) {
    const { style, feature, llCenter } = msg.data
    const result = build(feature, llCenter, style)

    const transferrables = [
      result.getAttribute('uv').array,
      result.getAttribute('position').array,
      result.getAttribute('normal').array,
      result.getAttribute('color').array
    ]
    // TODO fix origin?
    postMessage(result, '*', transferrables as any)
  }

  const METERS_PER_DEGREE_LL = 111139
  function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position, sceneScale = 1): Position {
    return [
      (lng - lngCenter) * METERS_PER_DEGREE_LL * sceneScale,
      (lat - latCenter) * METERS_PER_DEGREE_LL * sceneScale
    ]
  }

  function build(feature: Feature, llCenter: Position, style: IStyles): BufferGeometry | null {
    const shape = new Shape()

    const { geometry } =
      feature.geometry.type === 'LineString' ||
      feature.geometry.type === 'Point' ||
      feature.geometry.type === 'MultiLineString'
        ? buffer(feature, style.width || 1, {
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

// function buildGeometry(layerName: ILayerName, feature: Feature, llCenter: Position): BufferGeometry | null {
//   const shape = new Shape()
//   const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)

//   const geometry = maybeBuffer(feature, styles.width)

//   let coords: Position[]

//   // TODO switch statement
//   if (geometry.type === 'MultiPolygon') {
//     coords = geometry.coordinates[0][0] // TODO: add all multipolygon coords.
//   } else if (geometry.type === 'Polygon') {
//     coords = geometry.coordinates[0] // TODO: handle interior rings
//   } else if (geometry.type === 'MultiPoint') {
//     // TODO is this a bug?
//     coords = geometry.coordinates[0] as any
//   } else {
//     // TODO handle feature.geometry.type === 'GeometryCollection'?
//   }

//   var point = llToScene(coords[0], llCenter)
//   shape.moveTo(point[0], point[1])

//   coords.slice(1).forEach((coord: Position) => {
//     point = llToScene(coord, llCenter)
//     shape.lineTo(point[0], point[1])
//   })
//   point = llToScene(coords[0], llCenter)
//   shape.lineTo(point[0], point[1])

//   let height: number

//   // TODO handle min_height
//   if (styles.height === 'a') {
//     if (feature.properties.height) {
//       height = feature.properties.height
//     } else if (feature.properties.render_height) {
//       height = feature.properties.render_height
//     } else if (feature.properties.area) {
//       height = Math.sqrt(feature.properties.area)
//     } else {
//       // ignore standalone building labels.
//       console.warn('just a label.', feature.properties)
//       return null
//     }
//     height *= styles.height_scale || 1
//   } else {
//     height = styles.height || 4
//   }

//   let threejsGeometry: BufferGeometry | null = null

//   if (styles.extrude === 'flat') {
//     threejsGeometry = new ShapeGeometry(shape)
//   } else if (styles.extrude === 'rounded') {
//     threejsGeometry = new ExtrudeGeometry(shape, {
//       steps: 1,
//       depth: height || 1,
//       bevelEnabled: true,
//       bevelThickness: 8,
//       bevelSize: 16,
//       bevelSegments: 16
//     })
//   } else {
//     threejsGeometry = new ExtrudeGeometry(shape, {
//       steps: 1,
//       depth: height || 1,
//       bevelEnabled: false
//     })
//   }

//   if (threejsGeometry) {
//     threejsGeometry.rotateX(-Math.PI / 2)
//   }

//   if (styles.color && styles.color.builtin_function === 'purple_haze') {
//     const light = new Color(0xa0c0a0)
//     const shadow = new Color(0x303050)
//     colorVertices(threejsGeometry, getBuildingColor(feature), light, feature.properties.extrude ? shadow : light)
//   }

//   return threejsGeometry
// }

function buildGeometries(layerName: ILayerName, features: Feature[], llCenter: Position): BufferGeometry[] {
  const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName)
  const geometries = features.map((feature) => buildGeometry(layerName, feature, llCenter))

  // the current method of merging produces strange results with flat geometries
  // if (styles.extrude !== 'flat' && geometries.length > 1) {
  //   return [mergeBufferGeometries(geometries.filter((g) => g).map((g) => toIndexed(g)))]
  // } else {
  return geometries
  // }
}

function createCanvasRenderingContext2D(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d')
}

function generateTextureCanvas() {
  const contextSmall = createCanvasRenderingContext2D(32, 64)
  // plain it in white
  contextSmall.fillStyle = '#ffffff'
  contextSmall.fillRect(0, 0, 32, 64)
  // draw the window rows - with a small noise to simulate light variations in each room
  for (var y = 2; y < 64; y += 2) {
    for (var x = 0; x < 32; x += 2) {
      var value = Math.floor(Math.random() * 64)
      contextSmall.fillStyle = 'rgb(' + [value, value, value].join(',') + ')'
      contextSmall.fillRect(x, y, 2, 1)
    }
  }

  // build a bigger canvas and copy the small one in it
  // This is a trick to upscale the texture without filtering
  const largeCanvasWidth = 512
  const largeCanvasHeight = 1024
  const contextLarge = createCanvasRenderingContext2D(largeCanvasWidth, largeCanvasHeight)
  // disable smoothing
  contextLarge.imageSmoothingEnabled = false
  ;(contextLarge as any).webkitImageSmoothingEnabled = false
  ;(contextLarge as any).mozImageSmoothingEnabled = false
  // then draw the image
  contextLarge.drawImage(contextSmall.canvas, 0, 0, largeCanvasWidth, largeCanvasHeight)

  return contextLarge.canvas
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
  // const value = 1 - Math.random() * Math.random()
  // return new Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1)
  //
  // Workaround until we can clean up geojson data on the fly, ensuring that there aren't overlapping
  // polygons
  // return new Color(baseColorByFeatureId[featureId] || 0xdddddd)
  const specialColor = baseColorByFeatureType[feature.properties.type]
  return new Color(specialColor || 0xcacaca)
}

const geometrySize = new Vector3()
function colorVertices(geometry: BufferGeometry, baseColor: Color, light: Color, shadow: Color) {
  const normals = geometry.attributes.normal
  const topColor = baseColor.clone().multiply(light)
  const bottomColor = baseColor.clone().multiply(shadow)

  geometry.setAttribute('color', new BufferAttribute(new Float32Array(normals.count * 3), 3))

  const colors = geometry.attributes.color

  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.boundingBox.getSize(geometrySize)
  const alpha = 1 - Math.min(1, geometrySize.y / 200)
  const lerpedTopColor = topColor.lerp(bottomColor, alpha)

  for (let i = 0; i < normals.count; i++) {
    const color = normals.getY(i) === 1 ? lerpedTopColor : bottomColor
    colors.setXYZ(i, color.r, color.g, color.b)
  }
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
export function buildMeshes(layerName: ILayerName, features: Feature[], llCenter: Position): Mesh[] {
  const geometries = buildGeometries(layerName, features, llCenter)

  return geometries.map((g, i) => {
    const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, features[i].properties.class)

    const materialParams = {
      color: styles.color?.constant,
      vertexColors: styles.color?.builtin_function === 'purple_haze' ? true : false,
      depthTest: styles.extrude !== 'flat'
    }

    const material = getOrCreateMaterial(MeshLambertMaterial, materialParams)
    const mesh = new Mesh(g, material)
    mesh.renderOrder = styles.extrude === 'flat' ? -1 * (MAX_Z_INDEX - styles.zIndex) : Infinity
    return mesh
  })
}

function maybeBuffer(feature: Feature, width: number): Geometry {
  // Buffer the linestrings so they have some thickness
  if (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'Point' ||
    feature.geometry.type === 'MultiLineString'
  ) {
    const buf = buffer(feature, width || 1, {
      units: 'meters'
    })
    return buf.geometry
  }

  return feature.geometry
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

// export function createBuildings(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Mesh {
//   const features = unifyFeatures(collectFeaturesByLayer('building', vectorTiles))
//   const meshes = buildMeshes('building', features, llCenter)

//   return meshes[0]
// }
export function createBuildings(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Group {
  const features = unifyFeatures(collectFeaturesByLayer('building', vectorTiles))
  const meshes = buildMeshes('building', features, llCenter)

  const group = new Group()
  group.add(...meshes)

  return group
}

function createLayerGroup(layers: ILayerName[], vectorTiles: TileFeaturesByLayer[], llCenter: Position): Group {
  const meshes = layers.reduce((accMeshes, layerName) => {
    const featuresInLayer = collectFeaturesByLayer(layerName, vectorTiles)

    const meshes = buildMeshes(layerName, featuresInLayer, llCenter)
    return [...accMeshes, ...meshes]
  }, [])
  const group = new Group()
  if (meshes.length) {
    group.add(...meshes)
  }
  return group
}

export function createRoads(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Group {
  return createLayerGroup(['road'], vectorTiles, llCenter)
}

export function createWater(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Group {
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

export function createLandUse(vectorTiles: TileFeaturesByLayer[], llCenter: Position): Group {
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
