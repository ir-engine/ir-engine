import * as THREE from 'three';
import { Space } from '../enums/Space';
import { getMatrix } from './getMatrix';

export function getRight(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3 {
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		matrix.elements[0],
		matrix.elements[1],
		matrix.elements[2]
	);
}
