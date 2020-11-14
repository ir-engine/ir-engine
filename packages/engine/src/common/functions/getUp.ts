import * as THREE from 'three';
import { Space } from '../enums/Space';
import { getMatrix } from './getMatrix';

export function getUp(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3 {
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		matrix.elements[4],
		matrix.elements[5],
		matrix.elements[6]
	);
}
