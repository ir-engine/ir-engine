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
  ImageBitmapLoader,
  PlaneGeometry,
  Matrix4
} from 'three'
import { mergeBufferGeometries } from '../common/classes/BufferGeometryUtils'
import { VectorTile } from '@mapbox/vector-tile'
import { DEFAULT_FEATURE_STYLES } from './styles'
import turf_buffer from '@turf/buffer'
import { Feature, Geometry, Position } from 'geojson'
import { toIndexed } from './toIndexed'
import { Config } from '@xrengine/client-core/src/helper'

type ILayerName = 'building' | 'road'

// TODO free resources used by canvases, bitmaps etc

const METERS_PER_DEGREE_LL = 111139

function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position): Position {
  return [(lng - lngCenter) * METERS_PER_DEGREE_LL, (lat - latCenter) * METERS_PER_DEGREE_LL]
}
function tile2long(x: number, zoom: number) {
  return (x / Math.pow(2, zoom)) * 360 - 180
}
function tile2lat(y: number, zoom: number) {
  var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

const NUMBER_OF_TILES_PER_DIMENSION = 3
const WHOLE_NUMBER_OF_TILES_FROM_CENTER = Math.floor(NUMBER_OF_TILES_PER_DIMENSION / 2)
const NUMBER_OF_TILES_IS_ODD = NUMBER_OF_TILES_PER_DIMENSION % 2

function buildBuildingGeometry(feature: Feature, llCenter: Position): BufferGeometry | null {
  const shape = new Shape()
  const styles = DEFAULT_FEATURE_STYLES.building

  let geometry: Geometry

  let coords: Position[]
  // Buffer the linestrings (e.g. roads) so they have some thickness
  if (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'Point' ||
    feature.geometry.type === 'MultiLineString'
  ) {
    const width = styles.width || 1
    const buf = turf_buffer(feature, width, {
      units: 'meters'
    })
    geometry = buf.geometry
  } else {
    geometry = feature.geometry
  }

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

  colorVertices(threejsGeometry, getRandomBuildingColor())

  return threejsGeometry
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

function getRandomBuildingColor() {
  const value = 1 - Math.random() * Math.random()
  return new Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1)
}

function colorVertices(geometry: BufferGeometry, baseColor: Color) {
  const normals = geometry.attributes.normal
  const light = new Color(0xffffff)
  const shadow = new Color(0x303050)
  const topColor = baseColor.clone().multiply(light)
  const bottomColor = baseColor.clone().multiply(shadow)

  geometry.setAttribute('color', new BufferAttribute(new Float32Array(normals.count * 3), 3))

  const colors = geometry.attributes.color

  geometry.computeVertexNormals()

  for (let i = 0; i < normals.count; i++) {
    const color = normals.getY(i) === 1 ? topColor : bottomColor
    colors.setXYZ(i, color.r, color.g, color.b)
  }
}

/**
 * TODO adapt code from https://raw.githubusercontent.com/jeromeetienne/threex.proceduralcity/master/threex.proceduralcity.js
 */
export function buildBuildingsMesh(features: Feature[], llCenter: Position, renderer: WebGLRenderer): Mesh {
  const geometries = features
    .map((feature) => buildBuildingGeometry(feature, llCenter))
    .filter((geometry) => geometry)
    .map((geometry) => toIndexed(geometry))

  const mergedGeometry = mergeBufferGeometries(geometries)

  const texture = new CanvasTexture(generateTextureCanvas())
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.needsUpdate = true

  const material = new MeshLambertMaterial({
    map: texture,
    vertexColors: true
  })
  const mesh = new Mesh(mergedGeometry, material)

  return mesh
}

function drawRoads(ctx: CanvasRenderingContext2D, features: Feature[], llCenter: Position) {
  ctx.lineWidth = 5
  features.forEach(({ geometry }) => {
    switch (geometry.type) {
      case 'LineString':
        const coords = geometry.coordinates.map((coords) => llToScene(coords, llCenter))
        const start = coords[0]
        ctx.beginPath()
        ctx.moveTo(start[0], start[1])
        coords.slice(1).forEach(([x, y]) => {
          ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.stroke()
        break
    }
  })
}

export function buildGroundMesh(tiles: TileFeaturesByLayer[], llCenter: Position) {
  const startLongitude = tile2long(
    long2tile(llCenter[0], TILE_ZOOM) - NUMBER_OF_TILES_PER_DIMENSION / 2,
    TILE_ZOOM
  )
  const endLongitude = tile2long(
    long2tile(llCenter[0], TILE_ZOOM) + NUMBER_OF_TILES_PER_DIMENSION / 2,
    TILE_ZOOM
  )
  const startLatitude = tile2lat(
    lat2tile(llCenter[1], TILE_ZOOM) - NUMBER_OF_TILES_PER_DIMENSION / 2,
    TILE_ZOOM
  )
  const endLatitude = tile2lat(
    lat2tile(llCenter[1], TILE_ZOOM) + NUMBER_OF_TILES_PER_DIMENSION / 2,
    TILE_ZOOM
  )
  const diffLongitude = endLongitude - startLongitude
  const diffLatitude = endLatitude - startLatitude
  const geometry = new PlaneGeometry(diffLongitude * METERS_PER_DEGREE_LL, Math.abs(diffLatitude) * METERS_PER_DEGREE_LL)

  const canvasSize = 128 * NUMBER_OF_TILES_PER_DIMENSION
  const canvasContext = createCanvasRenderingContext2D(canvasSize, canvasSize)

  tiles.forEach((tile) => {
    drawRoads(canvasContext, tile.road, llCenter)
  })

  const texture = new CanvasTexture(canvasContext.canvas)

  const material = new MeshLambertMaterial({
    // enable renderOrder
    depthTest: false,
    map: texture
  })

  return new Mesh(geometry, material)
}

export function buildMesh(tiles: TileFeaturesByLayer[], llCenter: Position, renderer: WebGLRenderer): Mesh {
  const buildingFeatures = tiles.reduce((acc, tile) => acc.concat(tile.building), [])
  const buildingsMesh = buildBuildingsMesh(buildingFeatures, llCenter, renderer)
  const groundMesh = buildGroundMesh(tiles, llCenter)

  // prevent shimmer/z-fighting
  buildingsMesh.renderOrder = 1
  groundMesh.renderOrder = 0

  groundMesh.rotateX(-Math.PI / 2)
  // buildingsMesh.geometry.computeBoundingBox()
  // buildingsMesh.geometry.boundingBox.getCenter(groundMesh.position)
  // groundMesh.position.y = 0
  buildingsMesh.add(groundMesh)

  return buildingsMesh
}

/**
 * TODO this belongs in mapboxGeojsonClient
 */
const TILE_ZOOM = 16
const LAYERS: ILayerName[] = ['building', 'road']

import { vectors } from './vectors'
function long2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
}

function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )
}

/**
 * Return the features we care about from a tiles
 */
function vectorTile2GeoJSON(tile: VectorTile, [tileX, tileY]: Position): TileFeaturesByLayer {
  const result: TileFeaturesByLayer = {
    building: [],
    road: []
  }
  LAYERS.forEach((layerName) => {
    const vectorLayer = tile.layers[layerName]

    if (!vectorLayer) return

    for (let i = 0; i < vectorLayer.length; i++) {
      const feature = vectorLayer.feature(i).toGeoJSON(tileX, tileY, TILE_ZOOM)
      result[layerName].push(feature)
    }
  })
  return result
}

function getMapBoxUrl(layerId: string, tileX: number, tileY: number, format: string) {
  return `https://api.mapbox.com/v4/${layerId}/${TILE_ZOOM}/${tileX}/${tileY}.${format}?access_token=${Config.publicRuntimeConfig.MAPBOX_API_KEY}`
}

interface TileFeaturesByLayer {
  building: Feature[]
  road: Feature[]
}
async function fetchTileFeatures(tileX: number, tileY: number): Promise<TileFeaturesByLayer> {
  const url = getMapBoxUrl('mapbox.mapbox-streets-v8' /* or v8? */, tileX, tileY, 'vector.pbf')

  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    vectors(blob, (tile: VectorTile) => {
      resolve(vectorTile2GeoJSON(tile, [tileX, tileY]))
    })
  })
}

function forEachSurroundingTile(llCenter: Position, callback: (tileX: number, tileY: number) => void) {
  const tileX0 = long2tile(llCenter[0], TILE_ZOOM)
  const tileY0 = lat2tile(llCenter[1], TILE_ZOOM)
  const startIndex = -WHOLE_NUMBER_OF_TILES_FROM_CENTER
  const endIndex = NUMBER_OF_TILES_IS_ODD ? WHOLE_NUMBER_OF_TILES_FROM_CENTER : WHOLE_NUMBER_OF_TILES_FROM_CENTER - 1
  for (let i = startIndex; i <= endIndex; i++) {
    for (let j = startIndex; j <= endIndex; j++) {
      const tileX = tileX0 + i
      const tileY = tileY0 + j
      callback(tileX, tileY)
    }
  }
}

/**
 * @returns promise resolving to array containing one array of features per tile
 */
function fetchSurroundingTiles(llCenter: Position): Promise<TileFeaturesByLayer[]> {
  const promises = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchTileFeatures(tileX, tileY)))
  return Promise.all(promises)
}

export function fetchTiles(llCenter: Position): Promise<TileFeaturesByLayer[]> {
  return fetchSurroundingTiles(llCenter)
}
