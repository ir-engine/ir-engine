import { Object3D, Matrix4 } from 'three';
import { Space } from '../enums/Space';

export function getMatrix(obj: Object3D, space: Space): Matrix4 {
	switch (space) {
		case Space.Local: return obj.matrix;
		case Space.Global: return obj.matrixWorld;
	}
}
