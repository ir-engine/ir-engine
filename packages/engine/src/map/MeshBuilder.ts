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
  ColorRepresentation,
  Material
} from 'three'
import { mergeBufferGeometries } from '../common/classes/BufferGeometryUtils'
import { VectorTile } from '@mapbox/vector-tile'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from './styles'
import turfBuffer from '@turf/buffer'
import { Feature, Geometry, Position } from 'geojson'
import { toIndexed } from './toIndexed'
import { ILayerName, TileFeaturesByLayer } from './types'
import { NUMBER_OF_TILES_PER_DIMENSION } from './MapBoxClient'
import { unifyFeatures } from './GeoJSONFns'
import { Text } from 'troika-three-text'

// TODO free resources used by canvases, bitmaps etc

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
    colorVertices(
      threejsGeometry,
      getBuildingColor(feature.id as any),
      light,
      feature.properties.extrude ? shadow : light
    )
  }

  return threejsGeometry
}

function buildGeometries(layerName: ILayerName, features: Feature[], llCenter: Position): BufferGeometry[] {
  const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName)
  const geometries = features
    .filter((f) => f.properties.underground)
    .filter((f) => !featuresExcludedById[f.id])
    .map((feature) => buildGeometry(layerName, feature, llCenter))

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

const baseColorByFeatureId = {
  3616704: 0xccaacc
}

const featuresExcludedById = {
  883956342: true,
  883956343: true
}

function getBuildingColor(featureId: number) {
  // const value = 1 - Math.random() * Math.random()
  // return new Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1)
  //
  // Workaround until we can clean up geojson data on the fly, ensuring that there aren't overlapping
  // polygons
  // return new Color(baseColorByFeatureId[featureId] || 0xdddddd)
  const specialColor = baseColorByFeatureId[featureId]
  return new Color(specialColor || 0xdddddd)
}

function colorVertices(geometry: BufferGeometry, baseColor: Color, light: Color, shadow: Color) {
  const normals = geometry.attributes.normal
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
  const material = new MeshLambertMaterial({
    color: color.constant,
    vertexColors: color.builtin_function === 'purple_haze' ? true : false
  })
  return geometries.map((g) => new Mesh(g, material))
}

function maybeBuffer(feature: Feature, width: number): Geometry {
  // Buffer the linestrings so they have some thickness
  if (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'Point' ||
    feature.geometry.type === 'MultiLineString'
  ) {
    const buf = turfBuffer(feature, width, {
      units: 'meters'
    })
    return buf.geometry
  }

  return feature.geometry
}

function buildDebuggingLabels(features: Feature[], llCenter: Position): Object3D[] {
  return features.map((f) => {
    const myText = new Text()

    const geometry = f.geometry

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
    const point = llToScene(coords[0], llCenter)

    // Set properties to configure:
    myText.text = f.id
    myText.fontSize = 8
    myText.position.y = (f.properties.height || 1) + 10
    myText.position.x = point[0]
    myText.position.z = point[1]
    myText.color = 0x000000
    ;(myText.material as Material).depthTest = false

    // Update the rendering:
    myText.sync()

    return myText
  })
}

export function buildMesh(tiles: TileFeaturesByLayer[], llCenter: Position, renderer: WebGLRenderer): Group {
  const group = new Group()
  const buildingFeatures = unifyFeatures(tiles.reduce((acc, tile) => acc.concat(tile.building), []))
  const roadFeatures = tiles.reduce((acc, tile) => acc.concat(tile.road), [])
  const objects3d = [
    ...buildObjects3D('building', buildingFeatures, llCenter, renderer),
    ...buildObjects3D('road', roadFeatures, llCenter, renderer)
    // ...buildDebuggingLabels(buildingFeatures, llCenter)
  ]

  objects3d.forEach((o) => {
    group.add(o)
  })

  return group
}
