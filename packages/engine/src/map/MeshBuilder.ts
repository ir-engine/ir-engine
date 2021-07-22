import { MeshLambertMaterial, BufferGeometry, Mesh, Shape, ShapeGeometry, ExtrudeGeometry, Texture } from 'three'
import { mergeBufferGeometries } from '../common/classes/BufferGeometryUtils'
import { VectorTile } from '@mapbox/vector-tile'
import { DEFAULT_FEATURE_STYLES } from './styles'
import turf_buffer from '@turf/buffer'
import { Feature, GeoJsonProperties, Geometry, Position } from 'geojson'
import { toIndexed } from './toIndexed'

type ILayerName = 'building' | 'road'

interface IPropertiesX extends GeoJsonProperties {
  layer_name: ILayerName
}

interface IFeatureX extends Feature {
  properties: IPropertiesX
}

const METERS_PER_DEGREE_LL = 111139
function llToScene([lng, lat]: Position, [lngCenter, latCenter]: Position): Position {
  return [
    (lng - lngCenter) * METERS_PER_DEGREE_LL,
    (lat - latCenter) * METERS_PER_DEGREE_LL,
  ]
}

function buildGeometry(feature: IFeatureX, llCenter: Position): BufferGeometry | null {
  const shape = new Shape()
  const styles = DEFAULT_FEATURE_STYLES[feature.properties.layer_name]

  let goodGeometry: Geometry;

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
    goodGeometry = buf.geometry
  } else {
    goodGeometry = feature.geometry;
  }

  // TODO switch statement
  if (goodGeometry.type === 'MultiPolygon') {
    coords = goodGeometry.coordinates[0][0] // TODO: add all multipolygon coords.
  } else if (goodGeometry.type === 'Polygon') {
    coords = goodGeometry.coordinates[0]
  } else if (goodGeometry.type === 'MultiPoint') {
    // TODO is this a bug?
    coords = goodGeometry.coordinates[0] as any
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

  let geometry: BufferGeometry | null

  if (styles.extrude === 'flat') {
    geometry = new ShapeGeometry(shape)
  } else if (styles.extrude === 'rounded') {
    geometry = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: height || 1,
      bevelEnabled: true,
      bevelThickness: 8,
      bevelSize: 16,
      bevelSegments: 16
    })
  } else {
    geometry = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: height || 1,
      bevelEnabled: false
    })
  }

  geometry.rotateX(-Math.PI / 2)

  return geometry
}

function generateTextureCanvas() {
  // build a small canvas 32x64 and paint it in white
  var canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 64
  var context = canvas.getContext('2d')
  // plain it in white
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 32, 64)
  // draw the window rows - with a small noise to simulate light variations in each room
  for (var y = 2; y < 64; y += 2) {
    for (var x = 0; x < 32; x += 2) {
      var value = Math.floor(Math.random() * 64)
      context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')'
      context.fillRect(x, y, 2, 1)
    }
  }

  // build a bigger canvas and copy the small one in it
  // This is a trick to upscale the texture without filtering
  var canvas2 = document.createElement('canvas')
  canvas2.width = 512
  canvas2.height = 1024
  var context = canvas2.getContext('2d')
  // disable smoothing
  context.imageSmoothingEnabled = false
  ;(context as any).webkitImageSmoothingEnabled = false
  ;(context as any).mozImageSmoothingEnabled = false
  // then draw the image
  context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height)
  // return the just built canvas2
  return canvas2
}

/**
 * TODO adapt code from https://raw.githubusercontent.com/jeromeetienne/threex.proceduralcity/master/threex.proceduralcity.js
 */
export function buildMesh(tiles: IFeatureX[], llCenter: Position): Mesh {
  const geometries = tiles
    .map((tile) => buildGeometry(tile, llCenter))
    .filter((geometry) => geometry)
    .map((geometry) => toIndexed(geometry))

  const mergedGeometry = mergeBufferGeometries(geometries)

  // generate the texture
  var texture = new Texture(generateTextureCanvas())
  // texture.anisotropy = renderer.getMaxAnisotropy()
  texture.needsUpdate = true

  // build the mesh
  var material = new MeshLambertMaterial({
    color: 0xe8e8e8,
    map: texture
    // vertexColors: THREE.VertexColors
  })
  var mesh = new Mesh(mergedGeometry, material)
  // var mesh = new Mesh(geometries[0], material)
  return mesh
}

/**
 * TODO this belongs in mapboxGeojsonClient
 */
const TILE_ZOOM = 16
const LAYERS: ILayerName[] = ['building']

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
function vectorTile2GeoJSON(tile: VectorTile, [tileX, tileY]: Position): IFeatureX[] {
  const result = []
  LAYERS.forEach((layerName) => {
    const vectorLayer = tile.layers[layerName]

    if (!vectorLayer) return

    for (let i = 0; i < vectorLayer.length; i++) {
      const feature: IFeatureX = vectorLayer.feature(i).toGeoJSON(tileX, tileY, TILE_ZOOM)
      feature.properties.layer_name = layerName
      result.push(feature)
    }
  })
  return result
}

function loadTile(tileX: number, tileY: number): Promise<IFeatureX[]> {
  const MAPBOX_API_KEY =
    'pk.eyJ1IjoiY291bnRhYmxlLXdlYiIsImEiOiJjamQyZG90dzAxcmxmMndtdzBuY3Ywa2ViIn0.MU-sGTVDS9aGzgdJJ3EwHA'

  const url =
    'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/' +
    TILE_ZOOM +
    '/' +
    tileX +
    '/' +
    tileY +
    '.vector.pbf?access_token=' +
    MAPBOX_API_KEY

  return fetch(url)
    .then((response) => {
      return response.blob()
    })
    .then((blob) => {
      return new Promise((resolve) => {
        vectors(blob, (tile: VectorTile) => {
          resolve(vectorTile2GeoJSON(tile, [tileX, tileY]))
        })
      })
    })
}

/**
 * @returns promise resolving to array containing one array of features per tile
 */
function fetchSurroundingTiles([lngCenter, latCenter]: Position, size: number): Promise<IFeatureX[][]> {
  const promises = []
  const tile_x0 = long2tile(lngCenter, TILE_ZOOM)
  const tile_y0 = lat2tile(latCenter, TILE_ZOOM)
  for (let i = -size; i <= size; i++) {
    for (let j = -size; j <= size; j++) {
      var tile_x = tile_x0 + i
      var tile_y = tile_y0 + j
      promises.push(loadTile(tile_x, tile_y))
    }
  }
  return Promise.all(promises)
}

export async function fetchFeatures(llCenter: Position): Promise<IFeatureX[]> {
  let result: IFeatureX[] = []
  const tiles = await fetchSurroundingTiles(llCenter, 1)
  tiles.forEach((features) => {
    if (features.length > 0) {
      result = result.concat(features)
    }
  })
  return result
}
