console.log('Offscreen Worker Created!')
import { receiveWorker } from './MessageQueue';
import { initializeEngineOffscreen } from '../initializeOffscreen';

receiveWorker(initializeEngineOffscreen)
