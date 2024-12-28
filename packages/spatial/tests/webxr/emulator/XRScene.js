/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/


import {
	BoxGeometry,
	Color,
	DirectionalLight,
	DoubleSide,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	Vector3,
	WebGLRenderer,
} from 'three';
import { XRPlane, XRPlaneOrientation } from './api/XRPlane';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { XRMesh } from './api/XRMesh';
import XRSpace from 'webxr-polyfill/src/api/XRSpace';
import { mat4 } from 'gl-matrix';
import { isClient } from '@ir-engine/common/src/utils/getEnvironment';

const DEFAULT_CAMERA_POSITION = [0, 1.6, 0];
const PLANE_CONFIG = {
	FLOOR: {
		orientation: XRPlaneOrientation.Horizontal,
		quaternion: [0, 0, 0, 1],
		semanticLabel: 'floor',
	},
	CEILING: {
		orientation: XRPlaneOrientation.Horizontal,
		quaternion: [0, 0, 1, 0],
		semanticLabel: 'ceiling',
	},
	RIGHT: {
		orientation: XRPlaneOrientation.Vertical,
		quaternion: [0, 0, 0.7071068, 0.7071068],
		semanticLabel: 'wall',
	},
	LEFT: {
		orientation: XRPlaneOrientation.Vertical,
		quaternion: [0, 0, -0.7071068, 0.7071068],
		semanticLabel: 'wall',
	},
	FRONT: {
		orientation: XRPlaneOrientation.Vertical,
		quaternion: [0.7071068, 0, 0, 0.7071068],
		semanticLabel: 'wall',
	},
	BACK: {
		orientation: XRPlaneOrientation.Vertical,
		quaternion: [-0.7071068, 0, 0, 0.7071068],
		semanticLabel: 'wall',
	},
};
const DEFAULT_ROOM_DIMENSION = {
	x: 6,
	y: 3,
	z: 6,
};

const buildXRPlane = (width, length, position, planeConfig) => {
	const planeMatrix = new Float32Array(16);
	mat4.fromRotationTranslation(planeMatrix, planeConfig.quaternion, position);
	const planeSpace = new XRSpace();
	planeSpace._baseMatrix = planeMatrix;
	const points = [
		new DOMPointReadOnly(width, 0, length),
		new DOMPointReadOnly(width, 0, -length),
		new DOMPointReadOnly(-width, 0, -length),
		new DOMPointReadOnly(-width, 0, length),
		new DOMPointReadOnly(width, 0, length),
	];
	return new XRPlane(
		planeSpace,
		points,
		planeConfig.orientation,
		planeConfig.semanticLabel,
	);
};

/**
 * @param {THREE.Mesh} mesh
 */
const buildXRMesh = (mesh) => {
	const meshMatrix = new Float32Array(16);
	mat4.fromRotationTranslation(
		meshMatrix,
		mesh.quaternion.toArray(),
		mesh.position.toArray(),
	);
	const meshSpace = new XRSpace();
	meshSpace._baseMatrix = meshMatrix;
	const indices = mesh.geometry.index.array;
	const vertices = mesh.geometry.getAttribute('position').array;
	const semanticLabel = mesh.userData.semanticLabel;
	return new XRMesh(meshSpace, vertices, indices, semanticLabel);
};

class XRRoomFactory {
	constructor(scene) {
		this.scene = scene;
		this.roomObject = null;
		this.roomCollider = null;
		this.xrPlanes = [];
	}

	createRoom(x, y, z) {
		if (this.roomObject) this.scene.remove(this.roomObject);
		if (this.roomCollider) this.scene.remove(this.roomCollider);
		this.roomObject = new LineSegments(
			new BoxLineGeometry(
				x,
				y,
				z,
				Math.ceil(x * 2),
				Math.ceil(y * 2),
				Math.ceil(z * 2),
			),
			new LineBasicMaterial({ color: 0x808080 }),
		);
		this.roomObject.geometry.translate(0, y / 2, 0);
		this.scene.add(this.roomObject);
		this.xrPlanes = [
			buildXRPlane(x / 2, z / 2, [0, 0, 0], PLANE_CONFIG.FLOOR),
			buildXRPlane(x / 2, z / 2, [0, y, 0], PLANE_CONFIG.CEILING),
			buildXRPlane(y / 2, z / 2, [x / 2, y / 2, 0], PLANE_CONFIG.RIGHT),
			buildXRPlane(y / 2, z / 2, [-x / 2, y / 2, 0], PLANE_CONFIG.LEFT),
			buildXRPlane(x / 2, y / 2, [0, y / 2, z / 2], PLANE_CONFIG.BACK),
			buildXRPlane(x / 2, y / 2, [0, y / 2, -z / 2], PLANE_CONFIG.FRONT),
		];
		this.roomCollider = new Mesh(
			new BoxGeometry(x, y, z),
			new MeshBasicMaterial({
				side: DoubleSide,
			}),
		);
		this.roomCollider.visible = false;
		this.roomCollider.position.y = y / 2;
		this.scene.add(this.roomCollider);
	}
}

export default class XRScene {
	constructor() {
		this.renderer = null;
		this.camera = null;

		this.onCameraPoseUpdate = null;
		this.hitTestTarget = null;

		this._init();
	}

	_init() {
		const width = window.innerWidth;
		const height = window.innerHeight;

		if (isClient) {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('webgl2', { antialias: true });
			context.globalCompositeOperation = 'destination-over';
			
			const renderer = new WebGLRenderer({ canvas: canvas, context: context });
			renderer.setSize(width, height);
			canvas.width = width;
			canvas.height = height;
			renderer.domElement.oncontextmenu = () => {
				return false;
			};
			this.renderer = renderer;
		}

		const scene = new Scene();
		scene.background = new Color(0x444444);

		this.roomFactory = new XRRoomFactory(scene);
		this.roomFactory.createRoom(
			DEFAULT_ROOM_DIMENSION.x,
			DEFAULT_ROOM_DIMENSION.y,
			DEFAULT_ROOM_DIMENSION.z,
		);

		const camera = new PerspectiveCamera(90, width / height, 0.001, 1000.0);
		camera.position.fromArray(DEFAULT_CAMERA_POSITION);

		const light = new DirectionalLight(0xffffff, 4.0);
		light.position.set(-1, 1, -1);
		scene.add(light);

		// @TODO: only animate when headset pose change
		const animate = () => {
			requestAnimationFrame(animate);
			const renderer = this.renderer;
			if (!renderer) return;

			renderer.render(scene, camera);
			const canvas = renderer.domElement;
			var destCtx = canvas.getContext('2d');

			if (this.canvas) {
				destCtx.drawImage(this.appCanvas, 0, 0);
			}
		};

		animate();

		window.addEventListener(
			'resize',
			(_event) => {
				const width = window.innerWidth;
				const height = window.innerHeight;
				if (this.renderer) this.renderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			},
			false,
		);

		this.scene = scene;
		this.camera = camera;
		this.raycaster = new Raycaster();
		this.hitTestTarget = new Object3D();
		this.hitTestMarker = new Object3D();
		this.hitTestMarker.rotateX(-Math.PI / 2);
		this.hitTestTarget.add(this.hitTestMarker);
		this.userObjects = {};
	}

	inject(canvasContainer) {
		const appendCanvas = () => {
			if (this.renderer) canvasContainer.appendChild(this.renderer.domElement);
		};

		if (document.body) {
			appendCanvas();
		} else {
			document.addEventListener('DOMContentLoaded', appendCanvas);
		}
	}

	eject() {
		if (this.renderer) {
			const element = this.renderer.domElement;
			element.parentElement.remove();
		}
	}

	setCanvas(canvas) {
		this.appCanvas = canvas;
	}

	updateCameraTransform(positionArray, quaternionArray) {
		this.camera.position.fromArray(positionArray);
		this.camera.quaternion.fromArray(quaternionArray);
	}

	createRoom(dimension) {
		this.roomFactory.createRoom(dimension.x, dimension.y, dimension.z);
	}

	getHitTestResults(origin, direction) {
		this.raycaster.set(
			new Vector3().fromArray(origin),
			new Vector3().fromArray(direction),
		);
		const targets = [];
		if (this.roomFactory.roomCollider) {
			targets.push(this.roomFactory.roomCollider);
		}
		const intersects = this.raycaster.intersectObjects(targets, true);

		const results = [];
		intersects.forEach((intersect) => {
			this.hitTestTarget.position.copy(intersect.point);
			this.hitTestTarget.lookAt(
				new Vector3().addVectors(intersect.point, intersect.face.normal),
			);
			this.hitTestTarget.updateWorldMatrix(false, true);

			results.push(
				mat4.fromValues(...this.hitTestMarker.matrixWorld.toArray()),
			);
		});
		return results;
	}

	get xrPlanes() {
		return [
			...this.roomFactory.xrPlanes,
			...Object.values(this.userObjects)
				.filter((object) => object.userData.type === 'plane')
				.map((object) => object.userData.xrObjectRef),
		];
	}

	get xrMeshes() {
		return new Set(
			Object.values(this.userObjects)
				.filter((object) => object.userData.type === 'mesh')
				.map((object) => object.userData.xrObjectRef),
		);
	}

	updateUserObjects(objects) {
		// filter out hidden objects
		[...Object.keys(objects)].forEach((userObjectId) => {
			if (!objects[userObjectId].active) {
				delete objects[userObjectId];
			}
		});
		Object.entries(objects).forEach(([userObjectId, objectData]) => {
			const {
				type,
				width,
				height,
				depth,
				isVertical,
				semanticLabel,
				position,
				quaternion,
			} = objectData;
			let object;
			if (type === 'mesh') {
				if (!this.userObjects[userObjectId]) {
					const mesh = new Mesh(
						new BoxGeometry(width, height, depth),
						new MeshBasicMaterial({ color: 0xffffff * Math.random() }),
					);
					mesh.userData = { type, semanticLabel };
					this.userObjects[userObjectId] = mesh;
					this.scene.add(mesh);
					mesh.userData.xrObjectRef = buildXRMesh(mesh);
				}
				object = this.userObjects[userObjectId];
			} else if (type === 'plane') {
				if (!this.userObjects[userObjectId]) {
					const planeGeometry = new PlaneGeometry(width, height);
					planeGeometry.rotateX(Math.PI / 2);
					const mesh = new Mesh(
						planeGeometry,
						new MeshBasicMaterial({
							color: 0xffffff * Math.random(),
							side: DoubleSide,
						}),
					);
					mesh.userData = { type, semanticLabel };
					this.userObjects[userObjectId] = mesh;
					this.scene.add(mesh);
					mesh.userData.xrObjectRef = buildXRPlane(
						width / 2,
						height / 2,
						position,
						{
							orientation: isVertical
								? XRPlaneOrientation.Vertical
								: XRPlaneOrientation.Horizontal,
							quaternion,
							semanticLabel,
						},
					);
				}
				object = this.userObjects[userObjectId];
			}
			if (object) {
				object.position.fromArray(position);
				object.quaternion.fromArray(quaternion);
				object.userData.xrObjectRef._updateMatrix(position, quaternion);
			}
		});

		Object.keys(this.userObjects)
			.filter((key) => !Object.keys(objects).includes(key))
			.forEach((key) => {
				this.userObjects[key].parent.remove(this.userObjects[key]);
				delete this.userObjects[key];
			});
	}
}
