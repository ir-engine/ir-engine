import * as THREE from 'three';
import { Space } from '../enums/Space';
import { getMatrix } from "./getMatrix";

export function getBack(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3 {
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		-matrix.elements[8],
		-matrix.elements[9],
		-matrix.elements[10]
	);
}
