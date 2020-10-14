import { Vector3, Object3D } from 'three';
import { Space } from '../enums/Space';
import { getMatrix } from './getMatrix';

export function getUp(obj: Object3D, space: Space = Space.Global): Vector3 {
	const matrix = getMatrix(obj, space);
	return new Vector3(
		matrix.elements[4],
		matrix.elements[5],
		matrix.elements[6]
	);
}
