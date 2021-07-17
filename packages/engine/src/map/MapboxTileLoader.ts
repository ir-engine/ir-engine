import * as THREE from 'three'
import { DEFAULT_FEATURE_STYLES } from './styles'
import { vectors } from './vectors'
import turf_buffer from '@turf/buffer'

const extend = function (defaults: Object, o1: Object, o2?: Object, o3?: Object) {
  var extended = {}
  var prop
  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop]
    }
  }
  for (prop in o1) {
    if (Object.prototype.hasOwnProperty.call(o1, prop)) {
      extended[prop] = o1[prop]
    }
  }
  for (prop in o2 || {}) {
    if (Object.prototype.hasOwnProperty.call(o2, prop)) {
      extended[prop] = o2[prop]
    }
  }
  for (prop in o3 || {}) {
    if (Object.prototype.hasOwnProperty.call(o3, prop)) {
      extended[prop] = o3[prop]
    }
  }
  return extended
}

const METERS_PER_DEGREE_LL = 111139

var long2tile = function (lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
}

var lat2tile = function (lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )
}
var TILE_ZOOM = 16

// cache materials for perf.
var _mtl_cache = {}
var _get_material_cached = (color, opacity) => {
  var key = color + '|' + opacity
  if (!_mtl_cache[key]) {
    _mtl_cache[key] = new THREE.MeshLambertMaterial({
      color: color || 0xffffff,
      opacity: opacity,
      transparent: opacity < 1
      // shading: THREE.SmoothShading
    })
  }
  return _mtl_cache[key]
}

interface IOpts {
  lat?: number
  lng?: number
  layers?: string[]
  marker?: THREE.Object3D
}

export class MapboxTileLoader {
  private scene: THREE.Scene
  private opts: IOpts
  private marker?: THREE.Object3D
  private names: Object
  private kinds: Object
  private kind_details: Object
  private center: {
    lat?: number
    lng?: number
    start_lat?: number
    start_lng?: number
  }
  private feature_meshes: Array<any>
  private feature_styles: Object
  private meshes_by_layer: Object

  constructor(scene: THREE.Scene, opts: IOpts) {
    this.scene = scene
    this.opts = opts = opts || {}
    this.opts.layers = this.opts.layers || [
      'building',
      'road',
      // 'road_label',
      // 'barrier_line'
      // 'contour',
      // 'landuse',
      // 'motorway_junction',
      // 'poi_label',
    ]

    // tally feature tags.
    this.names = {}
    this.kinds = {}
    this.kind_details = {}

    this.center = {}
    this.marker = opts.marker

    if (opts.lat) {
      this.center.lat = opts.lat
    }
    if (opts.lng) {
      this.center.lng = opts.lng
    }

    // keep a reference to everything we add to the scene from map data.
    this.feature_meshes = []
    this.feature_styles = {} // global eature styling object.
    this.meshes_by_layer = {}

    this.init_feature_styles({})

    //setInterval(
    //  function () {
    //    if (!this.center.lat) return

    //    // keep latitude and longitude up to date for tile loading.
    //    if (this.marker) {
    //      this.center.lng = this.center.start_lng + this.marker.position.x / this.scale
    //      this.center.lat = this.center.start_lat - this.marker.position.z / this.scale
    //    }

    //    //load_tiles(this.center.lat, this.center.lng);
    //  }.bind(this),
    //  1000
    //)

    this.center.start_lng = this.center.lng
    this.center.start_lat = this.center.lat
    this.load_tiles(this.center.lat, this.center.lng)
  }

  handle_data = (data, x, y, z) => {
    this.opts.layers.forEach((layername) => {
      if (this.feature_styles[layername]) {
        this.add_vt(data, layername, x, y, z)
      }
    })
  }

  load_tile = (tx, ty, zoom, callback) => {
    var key = tx + '_' + ty + '_' + zoom
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
      .then(function (response) {
        return response.blob()
      })
      .then(function (blob) {
        //console.log(raw);
        vectors(blob, function (tile) {
          callback(tile, tx, ty, zoom)
        })
      })
  }

  load_tiles = (lat, lng) => {
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
          this.load_tile(tile_x, tile_y, TILE_ZOOM, this.handle_data)
        }
      }
    }
  }

  /**
   * Takes a 2d geojson, converts it to a THREE.Geometry, and extrudes it to a height
   * suitable for 3d viewing, such as for buildings.
   */
  extrude_feature_shape(feature, styles) {
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
    coords.slice(1).forEach(function (coord) {
      point = scope.ll_to_scene_coords(coord)
      shape.lineTo(point[0], point[1])
    })
    point = this.ll_to_scene_coords(coords[0])
    shape.lineTo(point[0], point[1])

    var height

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
      var height = styles.height || 1
    }

    let geometry

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

  /**
   * Add a geojson tile to the scene.
   */
  add_geojson(data, layername) {
    const geojson = data[layername]
    geojson.features.forEach((feature) => {
      this.add_feature(feature, layername)
    })
  }

  add_vt(tile, layername, x, y, z) {
    const vector_layer = tile.layers[layername]

    if (!vector_layer) return

    var scope = this
    for (var i = 0; i < vector_layer.length; i++) {
      var feature = vector_layer.feature(i).toGeoJSON(x, y, z)
      this.add_feature(feature, layername)
    }
  }

  add_feature(feature, layername) {
    feature.layername = layername
    var feature_styles = this.feature_styles

    // Style based on the the various feature property hints, in some order...
    var layer_styles = feature_styles[layername]
    var kind_styles = feature_styles[feature.properties.class] || {}

    let kind_detail_styles
    // kind_detail seems to copy landuse for roads, which is dumb, don't color it.
    if (layername === 'roads') {
      kind_detail_styles = {}
    } else {
      kind_detail_styles = feature_styles[feature.properties.subclass] || {}
    }

    var name_styles = feature_styles[feature.properties.name] || {}

    // Many features have a 'kind' property scope can be used for styling.
    var styles = extend(layer_styles, kind_styles, kind_detail_styles, name_styles)

    // tally feature "kind" (descriptive tags). used for debugging/enumerating available features and building stylesheets.
    this.kinds[feature.properties.class] = this.kinds[feature.properties.class] || 1
    this.names[feature.properties.name] = this.names[feature.properties.name] || 1
    this.kind_details[feature.properties.subclass] = this.kind_details[feature.properties.subclass] || 1
    this.kinds[feature.properties.class]++
    this.names[feature.properties.name]++
    this.kind_details[feature.properties.subclass]++

    var geometry = this.extrude_feature_shape(feature, styles)
    if (!geometry) {
      console.warn('no geomtry for feature')
      return
    }

    var opacity = (styles as any).opacity || 1
    let material = _get_material_cached((styles as any).color, opacity)

    // TODO, a better z-fighting avoidance method.
    /*
    material.polygonOffset = true;
    material.polygonOffsetFactor = (feature.properties.sort_rank || 100);
    material.polygonOffsetUnits = .1;
    material.depthTest = true;*/

    var mesh = new THREE.Mesh(geometry, material)

    // TODO, a better z-fighting avoidance method.
    mesh.position.y = (styles as any).offy || 0

    this.scene.add(mesh)
    this.feature_meshes.push(mesh)
    this.meshes_by_layer[layername] = this.meshes_by_layer[layername] || []
    this.meshes_by_layer[layername].push(mesh)
  }

  ll_to_scene_coords(coord) {
    return [
      (coord[0] - this.center.start_lng) * METERS_PER_DEGREE_LL,
      (coord[1] - this.center.start_lat) * METERS_PER_DEGREE_LL
    ]
  }

  init_feature_styles(styles) {
    // map feature styles.

    for (var k in DEFAULT_FEATURE_STYLES) {
      this.feature_styles[k] = DEFAULT_FEATURE_STYLES[k]
    }

    for (var k in styles) {
      this.feature_styles[k] = extend(this.feature_styles[k] || {}, styles[k])
    }

    for (var kind in this.feature_styles) {
      if (this.feature_styles[kind].fragment_shader || this.feature_styles[kind].vertex_shader) {
        this.feature_styles[kind].shader_material = this.setup_shader(this.feature_styles[kind])
      }
    }
  }

  /**
   * create a shader material from shader programs/snippets.
   * @param fs_part just modifies vec3 color and float opacity.
   * @param vs_part just modifies mvPosition.
   */

  setup_shader(opts) {
    var shader_uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() }
    }
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: shader_uniforms,
      vertexShader:
        opts.vertex_shader ||
        'uniform float time;\n' +
          'varying vec3 worldPos;\n' +
          'void main()\n' +
          '{\n' +
          '  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n' +
          '  worldPos = position;\n' +
          opts.vs_part ||
        '' + '  gl_Position = projectionMatrix * mvPosition;\n' + '}\n',
      fragmentShader:
        opts.fragment_shader ||
        'uniform vec2 resolution;\n' +
          'uniform float time;\n' +
          'varying vec3 worldPos;\n' +
          'void main(void)\n' +
          '{\n' +
          '  float opacity = 1.0;\n' +
          '  vec3 color = vec3(1.0,1.0,1.0);' +
          opts.fs_part ||
        '' + '  gl_FragColor=vec4(color,opacity);\n' + '}\n'
    })
  }
}
