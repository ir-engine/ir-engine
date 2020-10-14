import {Vector3, Geometry, Vector4, Face3} from "three";

export function createCapsuleGeometry(radius = 1, height = 2, N = 32): Geometry {
	const geometry = new Geometry();
	const TWOPI = Math.PI * 2;
	const PID2 = 1.570796326794896619231322;

	const normals = [];

	// top cap
	for (let i = 0; i <= N / 4; i++) {
		for (let j = 0; j <= N; j++) {
			const theta = j * TWOPI / N;
			const phi = -PID2 + Math.PI * i / (N / 2);
			const vertex = new Vector3();
			const normal = new Vector3();
			vertex.x = radius * Math.cos(phi) * Math.cos(theta);
			vertex.y = radius * Math.cos(phi) * Math.sin(theta);
			vertex.z = radius * Math.sin(phi);
			vertex.z -= height / 2;
			normal.x = vertex.x;
			normal.y = vertex.y;
			normal.z = vertex.z;
			geometry.vertices.push(vertex);
			normals.push(normal);
		}
	}

	// bottom cap
	for (let i = N / 4; i <= N / 2; i++) {
		for (let j = 0; j <= N; j++) {
			const theta = j * TWOPI / N;
			const phi = -PID2 + Math.PI * i / (N / 2);
			const vertex = new Vector3();
			const normal = new Vector3();
			vertex.x = radius * Math.cos(phi) * Math.cos(theta);
			vertex.y = radius * Math.cos(phi) * Math.sin(theta);
			vertex.z = radius * Math.sin(phi);
			vertex.z += height / 2;
			normal.x = vertex.x;
			normal.y = vertex.y;
			normal.z = vertex.z;
			geometry.vertices.push(vertex);
			normals.push(normal);
		}
	}

	for (let i = 0; i <= N / 2; i++) {
		for (let j = 0; j < N; j++) {
			const vec = new Vector4(
				i * (N + 1) + j,
				i * (N + 1) + (j + 1),
				(i + 1) * (N + 1) + (j + 1),
				(i + 1) * (N + 1) + j
			);

			if (i === N / 4) {
				const face1 = new Face3(vec.x, vec.y, vec.z, [
					normals[vec.x],
					normals[vec.y],
					normals[vec.z]
				]);

				const face2 = new Face3(vec.x, vec.z, vec.w, [
					normals[vec.x],
					normals[vec.z],
					normals[vec.w]
				]);

				geometry.faces.push(face2);
				geometry.faces.push(face1);
			}
			else {
				const face1 = new Face3(vec.x, vec.y, vec.z, [
					normals[vec.x],
					normals[vec.y],
					normals[vec.z]
				]);

				const face2 = new Face3(vec.x, vec.z, vec.w, [
					normals[vec.x],
					normals[vec.z],
					normals[vec.w]
				]);

				geometry.faces.push(face1);
				geometry.faces.push(face2);
			}
		}
		// if(i==(N/4)) break; // N/4 is when the center segments are solved
	}

	geometry.rotateX(Math.PI / 2);
	geometry.computeVertexNormals();
	geometry.computeFaceNormals();

	return geometry;
}
