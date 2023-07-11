
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


// From: https://github.com/justadudewhohacks/face-api.js/issues/47
// This is needed because face-api.js does not support working in a WebWorker natively
// Updated Dec 1 2020 to work on latest Chrome (tested in WebWorkers on Chrome Mobile on Android / Google Pixel 3 as well)
export {}
self.Canvas = self.HTMLCanvasElement = OffscreenCanvas;
// self.HTMLCanvasElement.name = 'HTMLCanvasElement';
// self.Canvas.name = 'Canvas';

self.CanvasRenderingContext2D = OffscreenCanvasRenderingContext2D;

function HTMLImageElement(){}
function HTMLVideoElement(){}

self.Image = HTMLImageElement;
self.Video = HTMLVideoElement;

function Storage () {
	let _data = {};
	this.clear = function(){ return _data = {}; };
	this.getItem = function(id){ return _data.hasOwnProperty(id) ? _data[id] : undefined; };
	this.removeItem = function(id){ return delete _data[id]; };
	this.setItem = function(id, val){ return _data[id] = String(val); };
}
class Document extends EventTarget {}

self.document = new Document();

self.window = self.Window = self;
self.localStorage = new Storage();

function createElement(element) {
	switch(element) {
		case 'canvas':
			let canvas = new Canvas(1,1);
			canvas.localName = 'canvas';
			canvas.nodeName = 'CANVAS';
			canvas.tagName = 'CANVAS';
			canvas.nodeType = 1;
			canvas.innerHTML = '';
			canvas.remove = () => { console.log('nope'); };
			return canvas;
		default:
			console.log('arg', element);
			break;
	}
}

document.createElement = createElement;
document.location = self.location;

// These are the same checks face-api.js/isBrowser does
if(typeof window !== 'object') {
	console.warn("Check failed: window");
}
if(typeof document === 'undefined') {
	console.warn("Check failed: document");
}
if(typeof HTMLImageElement === 'undefined') {
	console.warn("Check failed: HTMLImageElement");
}
if(typeof HTMLCanvasElement === 'undefined') {
	console.warn("Check failed: HTMLCanvasElement");
}
if(typeof HTMLVideoElement === 'undefined') {
	console.warn("Check failed: HTMLVideoElement");
}
if(typeof ImageData === 'undefined') {
	console.warn("Check failed: ImageData");
}
if(typeof CanvasRenderingContext2D === 'undefined') {
	console.warn("Check failed: CanvasRenderingContext2D");
}
self.window = window;
self.document = document;
self.HTMLImageElement = HTMLImageElement;
self.HTMLVideoElement = HTMLVideoElement;

// These are the same checks face-api.js/isBrowser does
const isBrowserCheck = typeof window === 'object'
	&& typeof document !== 'undefined'
	&& typeof HTMLImageElement !== 'undefined'
	&& typeof HTMLCanvasElement !== 'undefined'
	&& typeof HTMLVideoElement !== 'undefined'
	&& typeof ImageData !== 'undefined'
	&& typeof CanvasRenderingContext2D !== 'undefined';
;
if(!isBrowserCheck) {
	throw new Error("Failed to monkey patch for face-api, face-api will fail");
} else {
  console.log('face api patched yo')
}