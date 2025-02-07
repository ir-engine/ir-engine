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
import {WebAssembly} from '@callstack/polygen';
global.WebAssembly = WebAssembly;
globalThis.WebAssembly = WebAssembly;
import '@expo/browser-polyfill';
import 'react-native-get-random-values';
import {TextEncoder, TextDecoder} from 'text-encoding-shim';
import structuredClone from '@ungap/structured-clone';
import performance from 'react-native-performance';
import {URL} from 'whatwg-url-without-unicode';
import {Dimensions} from 'react-native';

window.location = new URL('https://mariale.ir.world/location/marbar');

global.performance = performance;
globalThis.XMLSerializer = class XMLSerializer {};
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.structuredClone = structuredClone;
global.localStorage = {
  _data: {},
  setItem: function (id, val) {
    return (this._data[id] = String(val));
  },
  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : null;
  },
  removeItem: function (id) {
    return delete this._data[id];
  },
  clear: function () {
    return (this._data = {});
  },
};

// Window polyfill
const listenerRegistry = new Map();
const resizeSubscriptions = new Map();

window.addEventListener = (type, handler) => {
  if (type === 'resize') {
    const subscription = Dimensions.addEventListener('change', handler);
    resizeSubscriptions.set(handler, subscription);
    return;
  }
  let registry = listenerRegistry.get(type);

  if (!registry) {
    registry = new Set();
    listenerRegistry.set(type, registry);
  }
  registry.add(handler);
};
window.removeEventListener = (type, handler) => {
  if (type === 'resize') {
    const subscription = resizeSubscriptions.get(handler);
    subscription?.remove();
    resizeSubscriptions.delete(handler);
    return;
  }

  const registry = listenerRegistry.get(type);
  if (registry) {
    registry.delete(handler);
  }
};
window.dispatchEvent = (eventType, evt) => {
  const listeners = listenerRegistry.get(eventType);
  if (listeners) {
    for (const listener of listeners) {
      listener(evt);
    }
  }
};

// Using PixelRatio.get() was causing issues with frame buffers. Let's default to 1.
window.devicePixelRatio = 1;

document.hasFocus = () => true;
globalThis.window.history = {
  pushState: () => {},
  replaceState: () => {},
  go: () => {},
  back: () => {},
  forward: () => {},
  length: 0,
  state: null,
};
