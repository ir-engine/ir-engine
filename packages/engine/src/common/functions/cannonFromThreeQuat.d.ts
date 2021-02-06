import * as THREE from 'three';
import * as CANNON from 'cannon-es';
/**
 * Converts {@link https://threejs.org/docs/#api/en/math/Quaternion | Quaternion} of three.js
 * into {@link http://schteppe.github.io/cannon.js/docs/classes/Quaternion.html | Quaternion} of Cannon-es library.
 *
 * @param quat Quaternion of three.js library.
 * @returns Quaternion of cannon-es library.
 */
export declare function cannonFromThreeQuat(quat: THREE.Quaternion): CANNON.Quaternion;
