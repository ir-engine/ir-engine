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


import { mat4 } from 'gl-matrix';

/**
 * @see https://immersive-web.github.io/real-world-geometry/plane-detection.html#plane-orientation
 * @enum {string}
 */
export const XRPlaneOrientation = {
	Horizontal: 'horizontal',
	Vertical: 'vertical',
};

/**
 * @see https://immersive-web.github.io/real-world-geometry/plane-detection.html#plane
 */
export class XRPlane {
	/**
	 * @param {import('webxr-polyfill/src/api/XRSpace').default} planeSpace
	 * @param {DOMPointReadOnly[]} pointArray
	 * @param {XRPlaneOrientation} orientation
	 * @param {string} semanticLabel
	 */
	constructor(planeSpace, pointArray, orientation, semanticLabel) {
		this._planeSpace = planeSpace;
		this._polygon = pointArray;
		Object.freeze(this._polygon);
		this._orientation = orientation;
		this._lastChangedTime = performance.now();
		this._semanticLabel = semanticLabel;
	}

	/**
	 * @type {import('webxr-polyfill/src/api/XRSpace').default}
	 * @readonly
	 */
	get planeSpace() {
		return this._planeSpace;
	}

	/**
	 * @type {DOMPointReadOnly[]}
	 * @readonly
	 */
	get polygon() {
		return this._polygon;
	}

	/**
	 * @type {XRPlaneOrientation}
	 * @readonly
	 */
	get orientation() {
		return this._orientation;
	}

	/**
	 * @type {DOMHighResTimeStamp}
	 * @readonly
	 */
	get lastChangedTime() {
		return this._lastChangedTime;
	}

	/**
	 * @type {string}
	 * @readonly
	 */
	get semanticLabel() {
		return this._semanticLabel;
	}

	/**
	 * non-standard
	 * @param {number[]} position
	 * @param {number[]} quaternion
	 */
	_updateMatrix(position, quaternion) {
		const meshMatrix = new Float32Array(16);
		mat4.fromRotationTranslation(meshMatrix, quaternion, position);
		this._planeSpace._baseMatrix = meshMatrix;
	}
}

export class XRPlaneSet extends Set {}
