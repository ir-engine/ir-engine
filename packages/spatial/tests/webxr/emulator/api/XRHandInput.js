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


import { PRIVATE, XRRemappedGamepad } from './XRGamepadInput';
import { mat4, vec3 } from 'gl-matrix';

import GamepadMappings from 'webxr-polyfill/src/devices/GamepadMappings';
import { XRHand } from './XRHand';
import XRInputSource from './XRInputSource';
import XRPose from 'webxr-polyfill/src/api/XRPose';
import XRRigidTransform from 'webxr-polyfill/src/api/XRRigidTransform';

export default class HandXRInputSource {
	constructor(polyfill) {
		this.polyfill = polyfill;
		this.nativeGamepad = null;
		this.gamepad = null;
		this.inputSource = new XRInputSource(this);
		this.lastPosition = vec3.create();
		this.emulatedPosition = false;
		this.basePoseMatrix = mat4.create();
		this.outputMatrix = mat4.create();
		this.primaryActionPressed = false;
		this.handedness = '';
		this.targetRayMode = 'gaze';
		this.armModel = null;

		this.hand = new XRHand(this.inputSource);
	}

	get profiles() {
		return [
			'oculus-hand',
			'generic-hand',
			'generic-hand-select',
			'generic-trigger',
		];
	}

	updateFromGamepad(gamepad, pinchValue) {
		if (this.nativeGamepad !== gamepad) {
			this.nativeGamepad = gamepad;
			if (gamepad) {
				this.gamepad = new XRRemappedGamepad(
					gamepad,
					{},
					GamepadMappings[gamepad.id],
				);
			} else {
				this.gamepad = null;
			}
		}
		this.handedness = gamepad.hand === '' ? 'none' : gamepad.hand;

		if (this.gamepad) {
			this.gamepad._update();
			this.gamepad[PRIVATE].buttons = [
				{
					pressed: pinchValue == 1,
					touched: pinchValue > 0,
					value: pinchValue,
				},
			];
			this.gamepad[PRIVATE].axes = [];
		}

		if (gamepad.pose) {
			this.targetRayMode = 'tracked-pointer';
			this.emulatedPosition = !gamepad.pose.hasPosition;
		} else if (gamepad.hand === '') {
			this.targetRayMode = 'gaze';
			this.emulatedPosition = false;
		}
	}

	updateBasePoseMatrix() {
		if (this.nativeGamepad && this.nativeGamepad.pose) {
			const pose = this.nativeGamepad.pose;
			const position = pose.position;
			const orientation = pose.orientation;
			// On initialization, we might not have any values
			if (!position && !orientation) {
				return;
			}
			mat4.fromRotationTranslation(this.basePoseMatrix, orientation, position);
		} else {
			mat4.copy(this.basePoseMatrix, this.polyfill.getBasePoseMatrix());
		}
		return this.basePoseMatrix;
	}

	/**
	 * @param {XRReferenceSpace} coordinateSystem
	 * @param {string} poseType
	 * @return {XRPose?}
	 */
	getXRPose(coordinateSystem, poseType) {
		this.updateBasePoseMatrix();

		switch (poseType) {
			case 'target-ray':
				coordinateSystem._transformBasePoseMatrix(
					this.outputMatrix,
					this.basePoseMatrix,
				);
				if (this.gamepad && this.gamepad[PRIVATE].targetRayTransform) {
					mat4.multiply(
						this.outputMatrix,
						this.outputMatrix,
						this.gamepad[PRIVATE].targetRayTransform,
					);
				}
				break;
			case 'grip':
				if (!this.nativeGamepad || !this.nativeGamepad.pose) {
					return null;
				}
				// TODO: Does the grip matrix need to be tweaked?
				coordinateSystem._transformBasePoseMatrix(
					this.outputMatrix,
					this.basePoseMatrix,
				);
				if (this.gamepad && this.gamepad[PRIVATE].gripTransform) {
					mat4.multiply(
						this.outputMatrix,
						this.outputMatrix,
						this.gamepad[PRIVATE].gripTransform,
					);
				}
				break;
			default:
				return null;
		}

		coordinateSystem._adjustForOriginOffset(this.outputMatrix);

		return new XRPose(
			new XRRigidTransform(this.outputMatrix),
			this.emulatedPosition,
		);
	}
}
