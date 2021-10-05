import { Vector3, Color, BufferGeometry, BufferAttribute, Shape, ShapeGeometry, ExtrudeGeometry } from 'three'
import createTaskWorker from '../../common/functions/createTaskWorker'
import { IStyles } from '../styles'
import { LongLat, toMetersFromCenter, METERS_PER_LONGLAT } from '../functions/UnitConversionFunctions'
import { computeBoundingCircleRadius } from '../GeoJSONFns'
import { SupportedFeature } from '../types'

declare function importScripts(...urls: string[]): void
// TODO eliminate duplicate code
// TODO create multiple worker threads, one for each core, and a loadbalancer?

function getTemp(): { $vector3: Vector3 } {
  this.__tempFactory =
    this.__tempFactory ||
    (() => {
      const $vector3 = new Vector3()
      return () => ({
        $vector3
      })
    })()

  return this.__tempFactory()
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

function getBuildingColor(feature: SupportedFeature) {
  const specialColor = baseColorByFeatureType[feature.properties.type]
  return new Color(specialColor || 0xcacaca)
}

function colorVertices(geometry: BufferGeometry, baseColor: Color, light: Color, shadow: Color) {
  const { $vector3 } = getTemp()
  const normals = geometry.attributes.normal
  const topColor = baseColor.clone().multiply(light)
  const bottomColor = baseColor.clone().multiply(shadow)

  geometry.setAttribute('color', new BufferAttribute(new Float32Array(normals.count * 3), 3))

  const colors = geometry.attributes.color

  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.boundingBox!.getSize($vector3)
  const alpha = 1 - Math.min(1, $vector3.y / 200)
  const lerpedTopColor = topColor.lerp(bottomColor, alpha)

  for (let i = 0; i < normals.count; i++) {
    const color = normals.getY(i) === 1 ? lerpedTopColor : bottomColor
    colors.setXYZ(i, color.r, color.g, color.b)
  }
}

function buildGeometry(feature: SupportedFeature, style: IStyles): BufferGeometry {
  const shape = new Shape()

  let coords: LongLat[]

  {
    const { geometry } = feature
    // TODO switch statement
    if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates[0][0] // TODO: add all multipolygon coords.
    } else if (geometry.type === 'Polygon') {
      coords = geometry.coordinates[0] // TODO: handle interior rings
    } else {
      throw new Error(`unexpected geometry type ${geometry.type}`)
    }
  }

  let point = coords[0]
  shape.moveTo(point[0], point[1])

  // TODO(perf) replace with for index loop, no slice
  coords.slice(1).forEach((point) => {
    shape.lineTo(point[0], point[1])
  })
  point = coords[0]
  shape.lineTo(point[0], point[1])

  let height = 0

  // TODO handle min_height
  if (style.height === 'a') {
    if (feature.properties.height) {
      height = feature.properties.height
    } else if (feature.properties.render_height) {
      height = feature.properties.render_height
    } else if (feature.properties.area) {
      height = Math.sqrt(feature.properties.area)
    } else {
      console.warn('just a label.', feature)
    }
    height *= style.height_scale || 1
  } else {
    height = style.height || 4
  }

  let bufferGeometry: BufferGeometry

  if (style.extrude === 'flat') {
    bufferGeometry = new ShapeGeometry(shape)
  } else if (style.extrude === 'rounded') {
    bufferGeometry = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: height || 1,
      bevelEnabled: true,
      bevelThickness: 8,
      bevelSize: 16,
      bevelSegments: 16
    })
  } else {
    bufferGeometry = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: height || 1,
      bevelEnabled: false
    })
  }

  bufferGeometry.rotateX(-Math.PI / 2)

  // TODO this isn't quite working as intended
  if (style.color && style.color.builtin_function === 'purple_haze') {
    const light = new Color(0xa0c0a0)
    const shadow = new Color(0x303050)
    colorVertices(bufferGeometry, getBuildingColor(feature), light, feature.properties.extrude ? shadow : light)
  }

  return bufferGeometry
}

export function createTaskHandler() {
  // TODO how to import from resources we control?
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
  // TODO only need bbox
  importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/turf.min.js')

  const { Vector3, Color, BufferGeometry, BufferAttribute, Shape, ShapeGeometry, ExtrudeGeometry } =
    /** @ts-ignore:next-line */
    THREE

  Object.assign(this, { Vector3, Color, BufferGeometry, BufferAttribute, Shape, ShapeGeometry, ExtrudeGeometry })

  return function handleBuildGeometryTask(feature: SupportedFeature, style: IStyles) {
    const geometry = buildGeometry(feature, style)

    const bufferGeometry = new BufferGeometry().copy(geometry)

    const arrayBuffers: ArrayBufferLike[] = []
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

    this.postResult({ geometry: { json: bufferGeometry.toJSON(), transfer: { attributes } } }, arrayBuffers)

    geometry.dispose()
    bufferGeometry.dispose()
  }
}

interface WorkerResult {
  geometry: {
    json: object
    transfer: {
      attributes: { [attributeName: string]: { array: Int32Array; itemSize: number; normalized: boolean } }
    }
  }
}

export default () => {
  return createTaskWorker<string, [SupportedFeature, IStyles], WorkerResult>(createTaskHandler, {
    buildGeometry,
    colorVertices,
    getBuildingColor,
    baseColorByFeatureType,
    toMetersFromCenter,
    METERS_PER_LONGLAT,
    getTemp,
    computeBoundingCircleRadius
  })
}
