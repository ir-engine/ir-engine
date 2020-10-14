import { MeshPhongMaterial } from 'three';

export function setupMeshProperties(child: any): void {
	child.castShadow = true;
	child.receiveShadow = true;

	if (child.material.map !== null) {
		const mat = new MeshPhongMaterial();
		mat.shininess = 0;
		mat.name = child.material.name;
		mat.map = child.material.map;
		mat.map.anisotropy = 4;
		mat.aoMap = child.material.aoMap;
		mat.transparent = child.material.transparent;
		mat.skinning = child.material.skinning;
		// mat.map.encoding = LinearEncoding;
		child.material = mat;
	}
}
