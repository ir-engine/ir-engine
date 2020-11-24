import * as THREE from 'three';
import { Space } from '../enums/Space';

export function getMatrix(obj: THREE.Object3D, space: Space): THREE.Matrix4 {
	switch (space) {
		case Space.Local: return obj.matrix;
		case Space.Global: return obj.matrixWorld;
	}
}
