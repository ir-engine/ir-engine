import { receiveWorker } from "three-physx";
import PHYSX from './physx.release.js';
import PHYSXwasm from './physx.release.wasm';
globalThis.PhysxWasmModule = PHYSXwasm; // make sure we link the asset

PHYSX().then(receiveWorker);