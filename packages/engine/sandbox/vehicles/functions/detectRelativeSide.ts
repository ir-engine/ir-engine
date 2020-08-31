import { Side } from '../enums/Side';
import { Object3D } from 'three';
import { Space } from './enums/Space';
import { getRight } from "../../../templates/character/functions/getRight";

export function detectRelativeSide(from: Object3D, to: Object3D): Side {
	const right = getRight(from, Space.Local);
	const viewVector = to.position.clone().sub(from.position).normalize();

	return right.dot(viewVector) > 0 ? Side.Left : Side.Right;
}
