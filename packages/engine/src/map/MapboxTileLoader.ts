import * as THREE from 'three'
import { IFeatureStyles, IFeatureStylesByLayerName, DEFAULT_FEATURE_STYLES } from './styles'
import { vectors } from './vectors'
import turf_buffer from '@turf/buffer'
import { VectorTile, VectorTileFeature } from '@mapbox/vector-tile'
import { isClient } from '../common/functions/isClient'
import { Object3D, Vector3 } from 'three'

function getRandomGreyColor(minValue, maxValue) {
  var colorValue = Math.floor(Math.random() * maxValue + minValue)
  return new THREE.Color(colorValue / 256, colorValue / 256, colorValue / 256)
}

function getRandomGreyColorString(minValue, maxValue) {
  const color = getRandomGreyColor(minValue, maxValue)
  return `#${color.getHexString()}`
}

function rescale(object3D: Object3D, scaleFactor: number) {
  object3D.position.multiplyScalar(scaleFactor)
  object3D.scale.multiplyScalar(scaleFactor)
}

// Generate a building canvas with the given width and height and return it
// Inspired by
//   - https://codepen.io/photonlines/details/JzaLYJ
//   - https://github.com/jeromeetienne/threex.proceduralcity/blob/master/threex.proceduralcity.js
function generateBuildingCanvas(width: number, height: number): HTMLCanvasElement {
  if (!isClient) return
  // Build a small canvas we're going to use to create our window elements
  if (!globalThis.document) return
  var smallCanvas = globalThis.document.createElement('canvas')

  smallCanvas.width = width
  smallCanvas.height = height

  // Get a two-dimensional rendering context for our canvas
  var context = smallCanvas.getContext('2d')

  // Set the building window dimensions
  const windowWidth = 1
  const windowHeight = 2
  const windowSpacingX = 0
  const windowSpacingY = 2

  // Draw the building windows
  for (var y = windowSpacingY / 2; y < height - windowSpacingY / 2; y += windowSpacingY + windowHeight) {
    for (var x = windowSpacingX / 2; x < width - windowSpacingX / 2; x += windowSpacingX + windowWidth) {
      // Here, we add slight color variations to vary the look of each window
      context.fillStyle = getRandomGreyColorString(8, 64)

      // Draw the window / rectangle at the given (x, y) position using our defined window dimensions
      context.fillRect(x, y, windowWidth, windowHeight)
    }
  }

  // Create a large canvas and copy the small one onto it. We do this to increase our original canvas
  // resolution:

  var largeCanvas = globalThis.document.createElement('canvas')

  largeCanvas.width = 256
  largeCanvas.height = 512

  context = largeCanvas.getContext('2d')

  // Disable the smoothing in order to avoid blurring our original one
  context.imageSmoothingEnabled = false
  ;(context as any).webkitImageSmoothingEnabled = false
  ;(context as any).mozImageSmoothingEnabled = false

  // Copy the smaller canvas onto the larger one
  context.drawImage(smallCanvas, 0, 0, largeCanvas.width, largeCanvas.height)

  return largeCanvas
}

const sideBuildingCanvasShort = generateBuildingCanvas(8, 16)
const sideBuildingCanvasTall = generateBuildingCanvas(8, 32)
const sideBuildingCanvasSkyScraper = generateBuildingCanvas(8, 64)

const METERS_PER_DEGREE_LL = 111139

function long2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
}

function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )
}
var TILE_ZOOM = 16

// We use a regular non-textured lambert mesh for our top / bottom faces
var topBottomMaterial = new THREE.MeshLambertMaterial({
  color: 0xe8e8e8
})

const lineMaterial = new THREE.LineBasicMaterial({
  // Color of lines
  color: 'rgb(0,0,0)',
  transparent: true,
  linewidth: 2,
  opacity: 1
})
// Prevent z-flighting
lineMaterial.polygonOffset = true
lineMaterial.depthTest = true
lineMaterial.polygonOffsetFactor = 1
lineMaterial.polygonOffsetUnits = 1.0

interface IOpts {
  lat?: number
  lng?: number
  layers?: string[]
  scale?: Vector3

  /** draw superimposed lines along the edges of all meshes */
  enableEdgeLines?: boolean
}

export class MapboxTileLoader {
  private scene: THREE.Scene
  private opts: IOpts
  private names: Object
  private kinds: Object
  private scale: Vector3
  private kind_details: Object
  private center: {
    lat?: number
    lng?: number
    start_lat?: number
    start_lng?: number
  }
  private feature_meshes: Array<any>
  private feature_styles: IFeatureStylesByLayerName
  private meshes_by_layer: Object

  constructor(scene: THREE.Scene, args: IOpts) {
    this.scene = scene
    this.opts = args = args || {}
    this.opts.layers = this.opts.layers || [
      'building',
      'road'
      // 'road_label',
      // 'barrier_line'
      // 'contour',
      // 'landuse',
      // 'motorway_junction',
      // 'poi_label'
    ]
    console.log('args.scale is', args.scale)
    this.scale = args.scale
    console.log('scale is', this.scale)

    // tally feature tags.
    this.names = {}
    this.kinds = {}
    this.kind_details = {}

    this.center = {}

    if (args.lat) {
      this.center.lat = args.lat
    }
    if (args.lng) {
      this.center.lng = args.lng
    }

    // keep a reference to everything we add to the scene from map data.
    this.feature_meshes = []
    this.feature_styles = {} // global eature styling object.
    this.meshes_by_layer = {}

    this.init_feature_styles()

    this.center.start_lng = this.center.lng
    this.center.start_lat = this.center.lat
    this.load_tiles(this.center.lat, this.center.lng)
  }

  handle_data = (data: VectorTile, x: number, y: number, z: number) => {
    this.opts.layers.forEach((layername) => {
      if (this.feature_styles[layername]) {
        this.add_vt(data, layername, x, y, z)
      }
    })
  }

  load_tile = (tx: number, ty: number, zoom: number) => {
    var MAPBOX_API_KEY =
      'pk.eyJ1IjoiY291bnRhYmxlLXdlYiIsImEiOiJjamQyZG90dzAxcmxmMndtdzBuY3Ywa2ViIn0.MU-sGTVDS9aGzgdJJ3EwHA'

    var url =
      'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/' +
      zoom +
      '/' +
      tx +
      '/' +
      ty +
      '.vector.pbf?access_token=' +
      MAPBOX_API_KEY

    fetch(url)
      .then((response) => {
        return response.blob()
      })
      .then((blob) => {
        vectors(blob, (tile: VectorTile) => {
          this.handle_data(tile, tx, ty, zoom)
        })
      })
  }

  load_tiles = (lat: number, lng: number) => {
    var MAP_CACHE = {}
    var tile_x0 = long2tile(lng, TILE_ZOOM)
    var tile_y0 = lat2tile(lat, TILE_ZOOM)
    var N = 1
    for (var i = -N; i <= N; i++) {
      for (var j = -N; j <= N; j++) {
        var tile_x = tile_x0 + i
        var tile_y = tile_y0 + j
        if (!tile_x || !tile_y) continue
        if (!MAP_CACHE[tile_x + '_' + tile_y + '_' + TILE_ZOOM]) {
          this.load_tile(tile_x, tile_y, TILE_ZOOM)
        }
      }
    }
  }

  /**
   * Takes a 2d geojson, converts it to a THREE.Geometry, and extrudes it to a height
   * suitable for 3d viewing, such as for buildings.
   *
   */
  extrude_feature_shape(feature: VectorTileFeature, styles: IFeatureStyles): THREE.BufferGeometry {
    var shape = new THREE.Shape()

    // Buffer the linestrings so they have some thickness (uses turf.js)
    if (
      feature.geometry.type === 'LineString' ||
      feature.geometry.type === 'Point' ||
      feature.geometry.type === 'MultiLineString'
    ) {
      var width = styles.width || 1
      var buf = turf_buffer(feature, width, {
        units: 'meters'
      })
      feature.geometry = buf.geometry
    }
    if (feature.geometry.type === 'MultiPolygon') {
      var coords = feature.geometry.coordinates[0][0] // TODO: add all multipolygon coords.
    } else {
      var coords = feature.geometry.coordinates[0]
    }

    var point = this.ll_to_scene_coords(coords[0])
    shape.moveTo(point[0], point[1])

    var scope = this
    coords.slice(1).forEach(function (coord: [number, number]) {
      point = scope.ll_to_scene_coords(coord)
      shape.lineTo(point[0], point[1])
    })
    point = this.ll_to_scene_coords(coords[0])
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

    let geometry: THREE.BufferGeometry

    if (styles.extrude === 'flat') {
      geometry = new THREE.ShapeGeometry(shape)
    } else if (styles.extrude === 'rounded') {
      geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        // amount: height || 1,
        depth: height || 1,
        bevelEnabled: true,
        bevelThickness: 8,
        bevelSize: 16,
        bevelSegments: 16
      })
    } else {
      geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        // amount: height || 1,
        depth: height || 1,
        bevelEnabled: false
      })
    }

    geometry.rotateX(-Math.PI / 2)

    return geometry
  }

  add_vt(tile: VectorTile, layername: string, x: number, y: number, z: number) {
    const vector_layer = tile.layers[layername]

    if (!vector_layer) return

    for (var i = 0; i < vector_layer.length; i++) {
      var feature = vector_layer.feature(i).toGeoJSON(x, y, z)
      this.add_feature(feature, layername)
    }
  }

  add_feature(feature: VectorTileFeature, layername: string) {
    feature.layername = layername
    var feature_styles = this.feature_styles

    // Style based on the the various feature property hints, in some order...
    var layer_styles = feature_styles[layername]
    var kind_styles = feature_styles[feature.properties.class] || {}

    let kind_detail_styles: IFeatureStyles
    // kind_detail seems to copy landuse for roads, which is dumb, don't color it.
    if (layername === 'roads') {
      kind_detail_styles = {}
    } else {
      kind_detail_styles = feature_styles[feature.properties.subclass] || {}
    }

    var name_styles = feature_styles[feature.properties.name] || {}

    // Many features have a 'kind' property scope can be used for styling.
    var styles = { ...layer_styles, ...kind_styles, ...kind_detail_styles, ...name_styles }

    // tally feature "kind" (descriptive tags). used for debugging/enumerating available features and building stylesheets.
    this.kinds[feature.properties.class] = this.kinds[feature.properties.class] || 1
    this.names[feature.properties.name] = this.names[feature.properties.name] || 1
    this.kind_details[feature.properties.subclass] = this.kind_details[feature.properties.subclass] || 1
    this.kinds[feature.properties.class]++
    this.names[feature.properties.name]++
    this.kind_details[feature.properties.subclass]++

    const geometry = this.extrude_feature_shape(feature, styles)
    if (!geometry) {
      console.warn('no geomtry for feature')
      return
    }

    const sideBuildingMaterial = new THREE.MeshLambertMaterial({
      color: getRandomGreyColor(0, 256)
    })
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    const height = bbox.max.y - bbox.min.y

    const MIN_HEIGHT_SKYSCRAPER = 120
    const MIN_HEIGHT_TALL_BUILDING = 30
    const MIN_HEIGHT_SMALL_BUILDING = 10
    if (height > MIN_HEIGHT_SMALL_BUILDING) {
      const texture = new THREE.CanvasTexture(
        height > MIN_HEIGHT_SKYSCRAPER
          ? sideBuildingCanvasSkyScraper
          : height > MIN_HEIGHT_TALL_BUILDING
          ? sideBuildingCanvasTall
          : sideBuildingCanvasShort
      )
      // Offset windows from the ground a bit for skyscrapers
      texture.offset.set(1, height > MIN_HEIGHT_SKYSCRAPER ? 1 + 10 / height : 1 + 1 / height)

      // Set repeat so that texture is scaled proportionally to height
      const repeat = height > MIN_HEIGHT_SKYSCRAPER ? 1.1 / height : 1.2 / height
      texture.repeat.set(repeat, repeat)

      // Repeat horizontally but not vertically
      texture.wrapS = THREE.RepeatWrapping

      // Necessary when using a canvas texture
      texture.needsUpdate = true

      sideBuildingMaterial.map = texture
    }
    var mesh = new THREE.Mesh(geometry, [topBottomMaterial, sideBuildingMaterial])

    if (this.opts.enableEdgeLines) {
      const edges = new THREE.EdgesGeometry(mesh.geometry, 30)
      const lineSegments = new THREE.LineSegments(edges, lineMaterial)
      rescale(lineSegments, this.scale.x)

      this.scene.add(lineSegments)
    }
    rescale(mesh, this.scale.x)

    this.scene.add(mesh)
    this.feature_meshes.push(mesh)
    this.meshes_by_layer[layername] = this.meshes_by_layer[layername] || []
    this.meshes_by_layer[layername].push(mesh)
  }

  ll_to_scene_coords(coord: [number, number]) {
    return [
      (coord[0] - this.center.start_lng) * METERS_PER_DEGREE_LL,
      (coord[1] - this.center.start_lat) * METERS_PER_DEGREE_LL
    ]
  }

  init_feature_styles() {
    for (var k in DEFAULT_FEATURE_STYLES) {
      this.feature_styles[k] = DEFAULT_FEATURE_STYLES[k]
    }
  }
}
