
import * as THREE from 'three';
import {DEFAULT_FEATURE_STYLES} from './styles';
import { vectors } from './vectors';
import earcut from 'earcut';

const extend = function(defaults, o1, o2, o3) {
    var extended = {};
    var prop;
    for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
            extended[prop] = defaults[prop];
        }
    }
    for (prop in o1) {
        if (Object.prototype.hasOwnProperty.call(o1, prop)) {
            extended[prop] = o1[prop];
        }
    }
    for (prop in o2 || {}) {
        if (Object.prototype.hasOwnProperty.call(o2, prop)) {
            extended[prop] = o2[prop];
        }
    }
    for (prop in o3 || {}) {
        if (Object.prototype.hasOwnProperty.call(o3, prop)) {
            extended[prop] = o3[prop];
        }
    }
    return extended;
};

export const ARMapzenGeography = function(scene, opts) {
  this.scene = scene;
    this.opts = opts = opts || {};
    this.opts.layers = this.opts.layers || ["building"];

    // tally feature tags.
    this.names = {};
    this.kinds = {};
    this.kind_details = {};

    this.center = opts.center || {};
    this.marker = opts.marker; // || new THREE.Object3D();

    if (opts.lat) {
        this.center.lat = opts.lat;
    }
    if (opts.lng) {
        this.center.lng = opts.lng;
    }

    this._drawn = {}; // avoid duplicate renderings.

    var long2tile = function(lon, zoom) {
        return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    };

    var lat2tile = function(lat, zoom) {
        return Math.floor(
            (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) /
            2 *
            Math.pow(2, zoom)
        );
    };

    var textureLoader = new THREE.TextureLoader();
    this.scale = 200000;
    var TILE_ZOOM = 16;

    this.feature_styles = {}; // global eature styling object.
    var feature_styles = this.feature_styles;

    this.init_feature_styles(opts.styles || {});

    var MAP_CACHE = {};

    setInterval(
        function() {
            if (!this.center.lat) return;

            // keep latitude and longitude up to date for tile loading.
            if (this.marker) {
                this.center.lng = this.center.start_lng + this.marker.position.x / this.scale;
                this.center.lat = this.center.start_lat - this.marker.position.z / this.scale;
            }

            //load_tiles(this.center.lat, this.center.lng);
        }.bind(this),
        1000
    );

    var scope = this;

    var handle_data = function(data, x, y, z) {
        scope.opts.layers.forEach(function(layername) {
            if (feature_styles[layername]) {
                scope.add_vt(data, layername, x, y, z);
            }
        });
    };

    var load_tile = function(tx, ty, zoom, callback) {
        var key = tx + "_" + ty + "_" + zoom;
        /*MAP_CACHE[key] = 1;
        try {
            var cached_data = localStorage["mz_" + key];
            if (cached_data && window.location.hash !== "#nocache") {
                cached_data = JSON.parse(cached_data);
                console.log("mapzen cache hit", key);
                setTimeout(function() {
                    callback(cached_data);
                }, 200);
                return;
            } else {
                console.log("mapen cache miss", key);
            }
        } catch (e) {
            console.log("mapzen cache error", key, e);
        }*/
        var MAPBOX_API_KEY = "pk.eyJ1IjoiY291bnRhYmxlLXdlYiIsImEiOiJjamQyZG90dzAxcmxmMndtdzBuY3Ywa2ViIn0.MU-sGTVDS9aGzgdJJ3EwHA";

        var url =
            //"https://tile.mapzen.com/mapzen/vector/v1/all/" + zoom + "/" + tx + "/" + ty + ".json?api_key=" + MAPZEN_API_KEY;
            //"https://tiles.countable.ca/data/v3/" + zoom + "/" + tx + "/" + ty + ".pbf"
            "https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/" + zoom + "/" + tx + "/" + ty + ".vector.pbf?access_token=" + MAPBOX_API_KEY
        fetch(url)
            .then(function(response) {
                return response.blob()
            })
            .then(function(blob) {
                //console.log(raw);
                vectors(blob, function(tile) {
                    callback(tile, tx, ty, zoom);
                    return; // Disable localstorage caching
                    try {
                        localStorage["mz_" + key] = JSON.stringify(geojson);
                    } catch (e) {
                        if (e.toString().indexOf("QuotaExceededError") > -1) {
                            localStorage.clear();
                        }
                        console.error(e);
                    }
                })
            });
    };

    var load_tiles = function(lat, lng) {

        var tile_x0 = long2tile(lng, TILE_ZOOM);
        var tile_y0 = lat2tile(lat, TILE_ZOOM);
        var N = 1;
        for (var i = -N; i <= N; i++) {
            for (var j = -N; j <= N; j++) {
                var tile_x = tile_x0 + i;
                var tile_y = tile_y0 + j;
                if (!tile_x || !tile_y) continue;
                if (!MAP_CACHE[tile_x + "_" + tile_y + "_" + TILE_ZOOM]) {
                    load_tile(tile_x, tile_y, TILE_ZOOM, handle_data);
                }
            }
        }
    };

    // keep a reference to everything we add to the scene from map data.
    this.feature_meshes = [];
    this.meshes_by_layer = {};

    /*
    var cobble_tex = {
      specularMap: textureLoader.load('textures/cobblestone/specular.png'),
      normalMap: textureLoader.load('textures/cobblestone/normal.jpg'),
      map: textureLoader.load('textures/cobblestone/diffuse.jpg'),
      displacementMap: textureLoader.load('textures/cobblestone/height.png')
    };

    for (var k izn cobble_tex) {

      var texture = cobble_tex[k];
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set( 40, 40 );
    }
    */

    this.center.start_lng = this.center.lng;
    this.center.start_lat = this.center.lat;
    load_tiles(this.center.lat, this.center.lng);

    this._building_material = (function() {
        // build a small canvas 32x64 and paint it in white
        var canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 64;
        var context = canvas.getContext("2d");
        // plain it in white
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, 32, 64);
        // draw the window rows - with a small noise to simulate light variations in each room
        for (var y = 2; y < 64; y += 2) {
            for (var x = 0; x < 32; x += 2) {
                var value = Math.floor(Math.random() * 64);
                context.fillStyle = "rgb(" + [value, value, value].join(",") + ")";
                context.fillRect(x, y, 2, 1);
            }
        }

        // build a bigger canvas and copy the small one in it
        // This is a trick to upscale the texture without filtering
        var canvas2 = document.createElement("canvas");
        canvas2.width = 512;
        canvas2.height = 1024;
        var context = canvas2.getContext("2d");
        // disable smoothing
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        // then draw the image
        context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);

        // generate the texture
        var texture = new THREE.Texture(canvas2);
        texture.needsUpdate = true;

        // build the mesh
        var material = new THREE.MeshLambertMaterial({
            map: texture,
            vertexColors: THREE.VertexColors
        });
        return material;
    })();
}

// Switch to earcut for triangulation:
// https://github.com/mrdoob/three.js/issues/5959
function addContour(vertices, contour) {
    for (var i = 0; i < contour.length; i++) {
        vertices.push(contour[i].x);
        vertices.push(contour[i].y);
    }
}

THREE.ShapeUtils.triangulateShape = function(contour, holes) {
    var vertices = [];

    addContour(vertices, contour);

    var holeIndices = [];
    var holeIndex = contour.length;

    for (i = 0; i < holes.length; i++) {
        holeIndices.push(holeIndex);
        holeIndex += holes[i].length;
        addContour(vertices, holes[i]);
    }

    var result = earcut(vertices, holeIndices, 2);

    var grouped = [];
    for (var i = 0; i < result.length; i += 3) {
        grouped.push(result.slice(i, i + 3));
    }
    return grouped;
};

/**
 * Takes a 2d geojson, converts it to a THREE.Geometry, and extrudes it to a height
 * suitable for 3d viewing, such as for buildings.
 */
ARMapzenGeography.prototype.extrude_feature_shape = function(feature, styles) {
    var shape = new THREE.Shape();

    // Buffer the linestrings so they have some thickness (uses turf.js)
    if (
        feature.geometry.type === "LineString" ||
        feature.geometry.type === "Point" ||
        feature.geometry.type === "MultiLineString"
    ) {
        var width = styles.width || 1;
        var buf = Bundle.turf_buffer(feature, width, {
            units: "meters"
        });
        feature.geometry = buf.geometry;
    }
    if (feature.geometry.type === "MultiPolygon") {
        var coords = feature.geometry.coordinates[0][0]; // TODO: add all multipolygon coords.
    } else {
        var coords = feature.geometry.coordinates[0];
    }

    var point = this.ll_to_scene_coords(coords[0]);
    shape.moveTo(point[0], point[1]);

    var scope = this;
    coords.slice(1).forEach(function(coord) {
        point = scope.ll_to_scene_coords(coord);
        shape.lineTo(point[0], point[1]);
    });
    point = this.ll_to_scene_coords(coords[0]);
    shape.lineTo(point[0], point[1]);

    var height;

    if (styles.height === "a") {
        if (feature.properties.height) {
            height = feature.properties.height;
        } else if (feature.properties.render_height) {
            height = feature.properties.render_height;
        } else if (feature.properties.area) {
            height = Math.sqrt(feature.properties.area);
        } else {
            // ignore standalone building labels.
            console.warn('just a label.', feature.properties)
            return null;
        }
        height *= styles.height_scale || 1;
    } else {
        var height = styles.height || 1;
    }

    if (styles.extrude === "flat") {
        var geometry = new THREE.ShapeGeometry(shape);
    } else if (styles.extrude === "rounded") {
        var extrudeSettings = {
            steps: 1,
            amount: height || 1,
            bevelEnabled: true,
            bevelThickness: 8,
            bevelSize: 16,
            bevelSegments: 16
        };
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else {
        var extrudeSettings = {
            steps: 1,
            amount: height || 1,
            bevelEnabled: false
        };
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    /*
    var nfaces = geometry.faces.length;
    var verts = geometry.vertices;
    for (var i = 0; i < nfaces; i++) {
        var face = geometry.faces[i];
        if (Math.abs(face.normal.y) > 1e-9) {
            var nbig = 0;
            if (verts[face.a].z > 10) nbig++;
            if (verts[face.b].z > 10) nbig++;
            if (verts[face.c].z > 10) nbig++;
            if (nbig == 2) {
                geometry.faceVertexUvs[0][i] = [
                    new THREE.Vector2(1, 1), // TL
                    new THREE.Vector2(1, 0), // BL
                    new THREE.Vector2(0, 0) // TR
                ];
            } else {
                geometry.faceVertexUvs[0][i] = [
                    new THREE.Vector2(0, 0), // TL
                    new THREE.Vector2(1, 0), // BL
                    new THREE.Vector2(1, 1) // TR
                ];
            }
        }
    }*/

    geometry.rotateX(-Math.PI / 2);

    return geometry;
};

/**
 * Add a geojson tile to the scene.
 */
ARMapzenGeography.prototype.add_geojson = function(data, layername) {
    geojson = data[layername];
    var scope = this;
    geojson.features.forEach(function(feature) {
        scope.add_feature(feature, layername);
    });
};

ARMapzenGeography.prototype.add_vt = function(tile, layername, x, y, z) {
    const vector_layer = tile.layers[layername];

    if(!vector_layer) return;

    var scope = this;
    for (var i = 0; i < vector_layer.length; i++) {
        var feature = vector_layer.feature(i).toGeoJSON(x, y, z);
        scope.add_feature(feature, layername);
    }
};

// cache materials for perf.
var _mtl_cache = {}
var _get_material_cached = (color, opacity) => {
    var key = color + '|' + opacity;
    if (!_mtl_cache[key]) {

        _mtl_cache[key] = new THREE.MeshLambertMaterial({
            color: color || 0xffffff,
            opacity: opacity,
            transparent: opacity < 1,
            shading: THREE.SmoothShading
        });
    }
    return _mtl_cache[key];
}

ARMapzenGeography.prototype.add_feature = function(feature, layername) {
    feature.layername = layername;
    var feature_styles = this.feature_styles;

    //console.log(layername, feature.properties);
    // we only cache at the tile level now, the following doesn't work,
    // since a feature could appear on multiple tiles.
    //if (this._drawn[feature.properties.id]) return;// avoid duplicate renderings. features might show up in 2 tiles.
    //this._drawn[feature.properties.id] = true;

    // Style based on the the various feature property hints, in some order...
    var layer_styles = feature_styles[layername];
    var kind_styles = feature_styles[feature.properties.class] || {};
    // kind_detail seems to copy landuse for roads, which is dumb, don't color it.

    if (layername === "roads") {
        var kind_detail_styles = {};
    } else {
        var kind_detail_styles = feature_styles[feature.properties.subclass] || {};
    }
    var name_styles = feature_styles[feature.properties.name] || {};
    //console.log(feature.properties);
    // Many features have a 'kind' property scope can be used for styling.
    var styles = extend(layer_styles, kind_styles, kind_detail_styles, name_styles);

    // Inherit some properties from containing landuse boundary?
    /*if (feature.properties.landuse_kind) { // special case for buildings.
      styles = THREE.extend(styles, feature_styles[feature.properties.landuse_kind || {}])
    }*/

    // tally feature "kind" (descriptive tags). used for debugging/enumerating available features and building stylesheets.
    this.kinds[feature.properties.class] = this.kinds[feature.properties.class] || 1;
    this.names[feature.properties.name] = this.names[feature.properties.name] || 1;
    this.kind_details[feature.properties.subclass] = this.kind_details[feature.properties.subclass] || 1;
    this.kinds[feature.properties.class]++;
    this.names[feature.properties.name]++;
    this.kind_details[feature.properties.subclass]++;

    var geometry = this.extrude_feature_shape(feature, styles);
    if (!geometry) {
        console.warn('no geomtry for feature')
        return;
    }

    var opacity = styles.opacity || 1;
    var material;
    /*if (styles.material == "building") {
        material = this._building_material;
    } else if (styles.shader_material) {
        material = styles.shader_material;
    } else {*/
    material = _get_material_cached(styles.color, opacity);
    //}

    // TODO, a better z-fighting avoidance method.
    /*
    material.polygonOffset = true;
    material.polygonOffsetFactor = (feature.properties.sort_rank || 100);
    material.polygonOffsetUnits = .1;
    material.depthTest = true;*/

    var mesh = new THREE.Mesh(geometry, material);

    // TODO, a better z-fighting avoidance method.
    mesh.position.y = styles.offy || 0;

    this.scene.add(mesh);
    mesh.feature = feature;
    //mesh.attributes = {position: mesh.position};
    this.feature_meshes.push(mesh);
    this.meshes_by_layer[layername] = this.meshes_by_layer[layername] || [];
    this.meshes_by_layer[layername].push(mesh);
};

ARMapzenGeography.prototype.ll_to_scene_coords = function(coord) {
    return [(coord[0] - this.center.start_lng) * this.scale, (coord[1] - this.center.start_lat) * this.scale];
};

ARMapzenGeography.prototype.init_feature_styles = function(styles) {
    // map feature styles.

    for (var k in DEFAULT_FEATURE_STYLES) {
        this.feature_styles[k] = DEFAULT_FEATURE_STYLES[k];
    }

    for (var k in styles) {
        this.feature_styles[k] = extend(this.feature_styles[k] || {}, styles[k]);
    }

    for (var kind in this.feature_styles) {
        if (this.feature_styles[kind].fragment_shader || this.feature_styles[kind].vertex_shader) {
            this.feature_styles[kind].shader_material = this.setup_shader(this.feature_styles[kind]);
        }
    }
};

/**
 * create a shader material from shader programs/snippets.
 * @param fs_part just modifies vec3 color and float opacity.
 * @param vs_part just modifies mvPosition.
 */

ARMapzenGeography.prototype.setup_shader = function(opts) {
    return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: shader_uniforms,
        vertexShader: opts.vertex_shader ||
            "uniform float time;\n" +
            "varying vec3 worldPos;\n" +
            "void main()\n" +
            "{\n" +
            "  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
            "  worldPos = position;\n" +
            opts.vs_part ||
            "" + "  gl_Position = projectionMatrix * mvPosition;\n" + "}\n",
        fragmentShader: opts.fragment_shader ||
            "uniform vec2 resolution;\n" +
            "uniform float time;\n" +
            "varying vec3 worldPos;\n" +
            "void main(void)\n" +
            "{\n" +
            "  float opacity = 1.0;\n" +
            "  vec3 color = vec3(1.0,1.0,1.0);" +
            opts.fs_part ||
            "" + "  gl_FragColor=vec4(color,opacity);\n" + "}\n"
    });
}
