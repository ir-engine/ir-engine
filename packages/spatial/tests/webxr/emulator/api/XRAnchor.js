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


import XRSpace from 'webxr-polyfill/src/api/XRSpace';
import { generateUUID } from 'three/src/math/MathUtils';
import localforage from 'localforage';

export const PRIVATE = Symbol('@@webxr-polyfill/XRAnchor');

const ANCHOR_DELETED_ERROR =
	'Unable to access anchor properties, the anchor was already deleted.';

export class XRAnchor {
	/**
	 * @param {import('webxr-polyfill/src/api/XRSession').default} session
	 * @param {import('webxr-polyfill/src/api/XRSpace').default} anchorSpace
	 */
	constructor(session, anchorSpace) {
		this[PRIVATE] = {
			session,
			anchorSpace,
		};
	}

	/**
	 * @type {import('webxr-polyfill/src/api/XRSpace').default}
	 */
	get anchorSpace() {
		if (this[PRIVATE].session.hasTrackedAnchor(this)) {
			return this[PRIVATE].anchorSpace;
		} else {
			throw new DOMException(ANCHOR_DELETED_ERROR, 'InvalidStateError');
		}
	}

	async requestPersistentHandle() {
		const handle = await savePersistentAnchor(this);
		await restorePersistentAnchors(this[PRIVATE].session);
		return handle;
	}

	delete() {
		this[PRIVATE].session.deleteTrackedAnchor(this);
	}
}

export class XRAnchorSet extends Set {}

export const savePersistentAnchor = async (anchor) => {
	const existingUUID = anchor[PRIVATE].session.getPersistentAnchorUUID(anchor);
	if (existingUUID) {
		return existingUUID;
	}
	const prefix = window.location.hostname + PRIVATE.toString();
	const anchorHandle = generateUUID();
	const matrix = Array.from(anchor[PRIVATE].anchorSpace._baseMatrix);
	await localforage.setItem(
		prefix + anchorHandle,
		JSON.stringify({ uuid: anchorHandle, matrixValue: matrix }),
	);
	return anchorHandle;
};

export const deletePersistentAnchor = async (uuid) => {
	const prefix = window.location.hostname + PRIVATE.toString();
	await localforage.removeItem(prefix + uuid);
};

export const restorePersistentAnchors = async (session) => {
	session.persistentAnchorsMap = new Map();
	const prefix = window.location.hostname + PRIVATE.toString();
	const keys = (await localforage.keys()).filter((key) =>
		key.startsWith(prefix),
	);
	keys.forEach(async (key) => {
		const { uuid, matrixValue } = JSON.parse(await localforage.getItem(key));
		const matrix = new Float32Array(matrixValue);
		const anchorSpace = new XRSpace();
		anchorSpace._baseMatrix = matrix;
		const anchor = new XRAnchor(session, anchorSpace);
		session.persistentAnchorsMap.set(uuid, anchor);
	});
};
