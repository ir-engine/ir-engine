import * as THREE from 'three';
import * as CANNON from 'cannon-es';
/**
 * Converts {@link https://threejs.org/docs/#api/en/math/Vector3 | Vector3} of three.js
 * into {@link http://schteppe.github.io/cannon.js/docs/classes/Quaternion.html | Quaternion} of Cannon-es library.
 *
 * @param quat Vector3 of three.js library.
 * @returns Quaternion of cannon-es library.
 */
export declare function cannonFromThreeVector(vec: THREE.Vector3): CANNON.Vec3;
