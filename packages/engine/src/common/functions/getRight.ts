import { Vector3, Object3D } from 'three';
import { Space } from '../enums/Space';
import { getMatrix } from './getMatrix';

export function getRight(obj: Object3D, space: Space = Space.Global): Vector3 {
	const matrix = getMatrix(obj, space);
	return new Vector3(
		matrix.elements[0],
		matrix.elements[1],
		matrix.elements[2]
	);
}
