
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
 * @author Deepkolos / https://github.com/deepkolos
 */

export class WorkerPool {
  constructor(pool = 4) {
    this.pool = pool
    this.queue = []
    this.workers = []
    this.workersResolve = []
    this.workerPendingTasks = []
    this.maxConcurrentTasks = 7
  }

  _initWorker(workerId) {
    if (!this.workers[workerId]) {
      const worker = this.workerCreator()
      worker.addEventListener('message', this._onMessage.bind(this, workerId))
      this.workers[workerId] = worker
      this.workerPendingTasks[workerId] = 0
      this.workersResolve[workerId] = []
    }
  }

  _getIdleWorker() {
    if (this.workerPendingTasks.length < this.pool) {
      for (let i = this.workerPendingTasks.length; i < this.pool; i++) {
        this._initWorker(i)
      }
    }
    const leastLoad = Math.min(...this.workerPendingTasks)
    if (leastLoad >= this.maxConcurrentTasks) {
      return -1
    }
    return this.workerPendingTasks.indexOf(leastLoad)
  }

  _onMessage(workerId, msg) {
    const requestId = msg.data.requestId
    const resolve = this.workersResolve[workerId][requestId]
    resolve && resolve(msg)

    if (this.queue.length) {
      const { resolve, msg, transfer } = this.queue.shift()
      msg.requestId = requestId
      this.workersResolve[workerId][requestId] = resolve
      this.workers[workerId].postMessage(msg, transfer)
    } else {
      this.workerPendingTasks[workerId]--
    }
  }

  setWorkerCreator(workerCreator) {
    this.workerCreator = workerCreator
  }

  setWorkerLimit(pool) {
    this.pool = pool
  }

  postMessage(msg, transfer) {
    return new Promise((resolve) => {
      const workerId = this._getIdleWorker()

      if (workerId !== -1) {
        this._initWorker(workerId)
        this.workerPendingTasks[workerId]++
        const requestId = this.workerPendingTasks[workerId]
        this.workersResolve[workerId][requestId] = resolve
        msg.requestId = requestId
        this.workers[workerId].postMessage(msg, transfer)
      } else {
        this.queue.push({ resolve, msg, transfer })
      }
    })
  }

  dispose() {
    this.workers.forEach((worker) => worker.terminate())
    this.workersResolve.length = 0
    this.workers.length = 0
    this.queue.length = 0
    this.workerPendingTasks.length = 0
  }
}
