import { buffer, center, points } from '@turf/turf'
import { Feature } from 'geojson'
import { BufferGeometry, Color } from 'three'
import convertFunctionToWorker from '../common/functions/convertFunctionToWorker'
import { isClient } from '../common/functions/isClient'
import { IStyles } from './styles'
import { LongLat } from './types'

declare function importScripts(...urls: string[]): void

// TODO eliminate duplicate code
// TODO use generator to streamline code
// TODO create multiple worker threads, one for each core, and a loadbalancer
const geometryWorkerFunction = function () {
  // TODO figure out how to use our own bundle
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
  importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/turf.min.js')

  const { Vector3, Shape, ShapeGeometry, ExtrudeGeometry, Color, BufferAttribute, BufferGeometry } =
    /* @ts-ignore:next-line */
    this.THREE as typeof THREE

  const turf = this.turf as { buffer: typeof buffer; center: typeof center; points: typeof points }

  const messageQueue = []
  let processingQueue = false

  this.onmessage = function (msg: Event) {
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
      const { geometry, geographicCenterPoint } = build(feature, llCenter, style)

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

      postMessage(
        { taskId, geometry: { json: bufferGeometry.toJSON(), transfer: { attributes } }, geographicCenterPoint },
        arrayBuffers as any
      )
    }
    processingQueue = false
  }, 200)

  const $vector3 = new Vector3()
  const METERS_PER_DEGREE_LL = 111139

  function llToScene([lng, lat]: LongLat, [lngCenter, latCenter]: LongLat, sceneScale = 1): [number, number] {
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

  function subtractArray2([a1, b1], [a2, b2]) {
    return [a1 - a2, b1 - b2]
  }

  function transformFeaturePoint(
    featurePoint: LongLat,
    featureCenterPointInScene: [number, number],
    mapCenter: LongLat
  ) {
    const pointInScene = llToScene(featurePoint, mapCenter)
    return subtractArray2(pointInScene as any, featureCenterPointInScene)
  }

  function build(
    feature: Feature,
    llCenter: LongLat,
    style: IStyles
  ): { geometry: BufferGeometry; geographicCenterPoint: LongLat } | null {
    const shape = new Shape()

    const { geometry } =
      feature.geometry.type === 'LineString' ||
      feature.geometry.type === 'Point' ||
      feature.geometry.type === 'MultiLineString'
        ? turf.buffer(feature, style.width || 1, {
            units: 'meters'
          })
        : feature

    let coords: LongLat[]

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

    const geographicCenterPoint = turf.center(turf.points(coords)).geometry.coordinates
    const geometryCenter = llToScene(geographicCenterPoint, llCenter)

    var point = transformFeaturePoint(coords[0], geometryCenter, llCenter)
    shape.moveTo(point[0], point[1])

    coords.slice(1).forEach((coord: LongLat) => {
      point = transformFeaturePoint(coord, geometryCenter, llCenter)
      shape.lineTo(point[0], point[1])
    })
    point = transformFeaturePoint(coords[0], geometryCenter, llCenter)
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

    return { geometry: threejsGeometry, geographicCenterPoint }
  }
}

export default ({ onmessage }: { onmessage: Worker['onmessage'] }) => {
  if (isClient) {
    const geometryWorker = convertFunctionToWorker(geometryWorkerFunction)
    geometryWorker.onmessage = onmessage
    return geometryWorker
  }
}
