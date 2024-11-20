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


import { XRJointSpace } from './XRJointSpace';

export const XRHandJoint = {
	Wrist: 'wrist',

	ThumbMetacarpal: 'thumb-metacarpal',
	ThumbPhalanxProximal: 'thumb-phalanx-proximal',
	ThumbPhalanxDistal: 'thumb-phalanx-distal',
	ThumbTip: 'thumb-tip',

	IndexFingerMetacarpal: 'index-finger-metacarpal',
	IndexFingerPhalanxProximal: 'index-finger-phalanx-proximal',
	IndexFingerPhalanxIntermediate: 'index-finger-phalanx-intermediate',
	IndexFingerPhalanxDistal: 'index-finger-phalanx-distal',
	IndexFingerTip: 'index-finger-tip',

	MiddleFingerMetacarpal: 'middle-finger-metacarpal',
	MiddleFingerPhalanxProximal: 'middle-finger-phalanx-proximal',
	MiddleFingerPhalanxIntermediate: 'middle-finger-phalanx-intermediate',
	MiddleFingerPhalanxDistal: 'middle-finger-phalanx-distal',
	MiddleFingerTip: 'middle-finger-tip',

	RingFingerMetacarpal: 'ring-finger-metacarpal',
	RingFingerPhalanxProximal: 'ring-finger-phalanx-proximal',
	RingFingerPhalanxIntermediate: 'ring-finger-phalanx-intermediate',
	RingFingerPhalanxDistal: 'ring-finger-phalanx-distal',
	RingFingerTip: 'ring-finger-tip',

	PinkyFingerMetacarpal: 'pinky-finger-metacarpal',
	PinkyFingerPhalanxProximal: 'pinky-finger-phalanx-proximal',
	PinkyFingerPhalanxIntermediate: 'pinky-finger-phalanx-intermediate',
	PinkyFingerPhalanxDistal: 'pinky-finger-phalanx-distal',
	PinkyFingerTip: 'pinky-finger-tip',
};

export const PRIVATE = Symbol('@@webxr-polyfill/XRHand');

export class XRHand extends Map {
	constructor(inputSource) {
		super();
		this[PRIVATE] = {
			inputSource,
		};
		Object.values(XRHandJoint).forEach((jointName) => {
			this.set(jointName, new XRJointSpace(jointName, this));
		});
	}
}
