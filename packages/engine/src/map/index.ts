import * as THREE from 'three';
import {MapboxTileLoader} from './MapboxTileLoader';

export const addMap = function(scene: THREE.Scene) {
    new MapboxTileLoader(scene, {
        // NYC
        // latitude: 40.707,
        // longitude: -74.01

        // SF
        lat: 37.7749,
        lng: -122.4194,
    });
};


