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

/**
 * Wraps a worker in a blob URL to allow it to be referenced from a separate domain (such as an edge cache)
 * Injects process.env so it can be used in the worker context
 * @param {string} path
 * @param {boolean} isModule
 * @param {WorkerOptions} workerArgs
 * @returns {string}
 */
export const createWorkerFromCrossOriginURL = (path: string, isModule = true, workerArgs: WorkerOptions = {}) => {
  const data = `globalThis.process = ${JSON.stringify(process)};\n`.concat(
    isModule ? `import '${path}';` : `importScripts('${path}')`
  )

  const workerBlob = new Blob([data], { type: 'text/javascript' })

  const workerBlobUrl = URL.createObjectURL(workerBlob)

  return new Worker(workerBlobUrl, { type: isModule ? 'module' : 'classic', ...workerArgs })
}
