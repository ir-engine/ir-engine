// @ts-ignore
import { SMAASearchImageData } from './SMAASearchImageData.ts';
// @ts-ignore
import { SMAAAreaImageData } from './SMAAAreaImageData.ts';

/**
 * Handles messages from the main thread.
 *
 * @private
 * @param {Event} event - A message event.
 */

self.addEventListener('message', (event) => {
  const areaImageData = SMAAAreaImageData.generate();
  const searchImageData = SMAASearchImageData.generate();

  postMessage({ areaImageData, searchImageData }, "*",
    [areaImageData.data.buffer, searchImageData.data.buffer]);

  close();
});
