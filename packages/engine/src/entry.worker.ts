console.log('Offscreen Worker Created!')
import { receiveWorker } from './worker/MessageQueue';
import { initializeEngineOffscreen } from './initializeOffscreen';

receiveWorker(initializeEngineOffscreen)
