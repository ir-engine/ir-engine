import { receiveWorker } from "three-physx";
import PHYSX from './physx.release.js';

PHYSX().then(receiveWorker);