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
  WebGLRenderer,
  BufferAttribute,
  Color,
  CanvasTexture,
  Group,
  Object3D,
  Vector3,
  PlaneGeometry,
  MeshLambertMaterialParameters
} from 'three'
import { Text } from 'troika-three-text'
import { mergeBufferGeometries } from '../common/classes/BufferGeometryUtils'
import { unifyFeatures } from './GeoJSONFns'
import {
  calcMetersPerPixelLatitudinal,
  calcMetersPerPixelLongitudinal,
  NUMBER_OF_TILES_PER_DIMENSION,
  RASTER_TILE_SIZE_HDPI
} from './MapBoxClient'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from './styles'
import { toIndexed } from './toIndexed'
import { ILayerName, TileFeaturesByLayer } from './types'

// TODO free resources used by canvases, bitmaps etc

const ENABLE_DEBUG = false

const METERS_PER_DEGREE_LL = 111139

function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position): Position {
  return [(lng - lngCenter) * METERS_PER_DEGREE_LL, (lat - latCenter) * METERS_PER_DEGREE_LL]
}

function buildGeometry(layerName: ILayerName, feature: Feature, llCenter: Position): BufferGeometry {
  const shape = new Shape()
  const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)

  const geometry = maybeBuffer(feature, styles.width)

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
  if (styles.height === 'a') {
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
    height *= styles.height_scale || 1
  } else {
    height = styles.height || 4
  }

  let threejsGeometry: BufferGeometry | null

  if (styles.extrude === 'flat') {
    threejsGeometry = new ShapeGeometry(shape)
  } else if (styles.extrude === 'rounded') {
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

  threejsGeometry.rotateX(-Math.PI / 2)

  if (styles.color && styles.color.builtin_function === 'purple_haze') {
    const light = new Color(0xa0c0a0)
    const shadow = new Color(0x303050)
    colorVertices(threejsGeometry, getBuildingColor(feature), light, feature.properties.extrude ? shadow : light)
  }

  return threejsGeometry
}

function buildGeometries(layerName: ILayerName, features: Feature[], llCenter: Position): BufferGeometry[] {
  const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName)
  const geometries = features.map((feature) => buildGeometry(layerName, feature, llCenter))

  // the current method of merging produces strange results with flat geometries
  if (styles.extrude !== 'flat') {
    return [mergeBufferGeometries(geometries.map((g) => toIndexed(g)))]
  } else {
    return geometries
  }
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
  const positions = geometry.attributes.position
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
export function buildObjects3D(
  layerName: ILayerName,
  features: Feature[],
  llCenter: Position,
  renderer: WebGLRenderer
): Object3D[] {
  const geometries = buildGeometries(layerName, features, llCenter)

  const texture = new CanvasTexture(generateTextureCanvas())
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.needsUpdate = true

  const color = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName).color
  const materialParams = {
    color: color.constant,
    vertexColors: color.builtin_function === 'purple_haze' ? true : false
  }

  const material = getOrCreateMaterial(MeshLambertMaterial, materialParams)

  return geometries.map((g) => new Mesh(g, material))
}

function maybeBuffer(feature: Feature, width: number): Geometry {
  // Buffer the linestrings so they have some thickness
  if (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'Point' ||
    feature.geometry.type === 'MultiLineString'
  ) {
    const buf = buffer(feature, width, {
      units: 'meters'
    })
    return buf.geometry
  }

  return feature.geometry
}

function buildDebuggingLabels(features: Feature[], llCenter: Position): Object3D[] {
  return features.map((f) => {
    const myText = new Text()

    const point = llToScene(centerOfMass(f).geometry.coordinates, llCenter)

    // Set properties to configure:
    myText.text = f.properties.type
    myText.fontSize = 5
    myText.position.y = (f.properties.height || 1) + 50
    myText.position.x = point[0]
    myText.position.z = point[1]
    myText.color = 0x000000

    // Update the rendering:
    myText.sync()

    return myText
  })
}

export function createGround(rasterTiles: ImageBitmap[], latitude: number): Object3D {
  const sizeInPx = NUMBER_OF_TILES_PER_DIMENSION * RASTER_TILE_SIZE_HDPI
  const width = sizeInPx * calcMetersPerPixelLongitudinal(latitude)
  const height = sizeInPx * calcMetersPerPixelLatitudinal(latitude)
  const geometry = new PlaneGeometry(width, height)
  const texture = rasterTiles.length > 0 ? new CanvasTexture(generateRasterTileCanvas(rasterTiles)) : null

  const material = getOrCreateMaterial(
    MeshBasicMaterial,
    texture
      ? {
          map: texture
        }
      : {
          color: 0x81925c
        }
  )
  const mesh = new Mesh(geometry, material)

  // prevent z-fighting with vector roads
  material.depthTest = false
  mesh.renderOrder = -1

  // rotate to face up
  mesh.rotateX(-Math.PI / 2)

  // TODO why do the vector tiles and the raster tiles not line up?
  mesh.position.x -= 80
  mesh.position.z -= 50

  return mesh
}

export function createBuildings(
  vectorTiles: TileFeaturesByLayer[],
  llCenter: Position,
  renderer: WebGLRenderer
): Object3D {
  const features = unifyFeatures(vectorTiles.reduce((acc, tile) => acc.concat(tile.building), []))
  const objects3d = buildObjects3D('building', features, llCenter, renderer)

  return objects3d[0]
}

export function createRoads(vectorTiles: TileFeaturesByLayer[], llCenter: Position, renderer: WebGLRenderer): Group {
  const group = new Group()
  const features = vectorTiles.reduce((acc, tile) => acc.concat(tile.road), [])
  const objects3d = buildObjects3D('road', features, llCenter, renderer)

  objects3d.forEach((o) => {
    group.add(o)
  })

  return group
}
