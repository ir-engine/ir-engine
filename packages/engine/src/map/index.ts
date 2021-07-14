import * as THREE from 'three';
import {ARMapzenGeography} from './geography.js';

export const addMap = function(scene: THREE.Scene) {
    /* Standard THREE.JS stuff */
    init_ground(scene);

    init_geo(scene, {
      coords: {
        // NYC
        // latitude: 40.707,
        // longitude: -74.01

        // SF
        latitude: 37.7749,
        longitude: -122.4194
      }
    });

};

var init_geo = function(scene, position) {
    (window as any)._ar_position = position;
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    init_ar(scene, lat, lng);
};

var init_ground = function(scene: THREE.Scene) {
    // Ground.
    var gd_tex = (new THREE.TextureLoader()).load("../../assets/textures/cobblestone/diffuse.jpg");
    gd_tex.wrapS = THREE.RepeatWrapping;
    gd_tex.wrapT = THREE.RepeatWrapping;
    gd_tex.repeat.set(200, 200);

    // var gd_normal = (new THREE.TextureLoader()).load("../../assets/textures/cobblestone/normal.jpg");
    // gd_normal.wrapS = THREE.RepeatWrapping;
    // gd_normal.wrapT = THREE.RepeatWrapping;
    // gd_normal.repeat.set( 200, 200 );

    // var gd_spec = (new THREE.TextureLoader()).load("../../assets/textures/cobblestone/specular.png");
    // gd_spec.wrapS = THREE.RepeatWrapping;
    // gd_spec.wrapT = THREE.RepeatWrapping;
    // gd_spec.repeat.set( 200, 200 );

    var geometry = new THREE.PlaneBufferGeometry(3000, 3000);
    geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshPhongMaterial({
        color: 0x884444,
        map: gd_tex,
        //normalMap: gd_normal,
        //specularMap: gd_spec,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.y = -3;
    plane.renderOrder = -5;
    scene.add(plane);
};

var ar_world, ar_geo;
var init_ar = function(scene, lat, lng) {
    ar_geo = new ARMapzenGeography(scene, {
        lat: lat,
        lng: lng,
        layers: [
            "transportation",
            //"landcover",
            "building",
            //"landuse",
            "place",
            "poi"
        ]
    });
};

