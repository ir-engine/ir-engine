type PromiseQueueItem<T> = {
  promise: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: any) => void
}

export class PromiseQueue<T> {
  queue = [] as PromiseQueueItem<T>[]
  resolving = 0
  maxConcurrent = 1

  constructor(maxConcurrent?: number) {
    if (maxConcurrent) this.maxConcurrent = maxConcurrent
  }

  dequeuePromise() {
    if (this.resolving === this.maxConcurrent) return

    const next = this.queue.shift()
    if (!next) return

    this.resolving += 1
    next
      .promise()
      .then((value) => {
        next.resolve(value)
      })
      .catch((reason) => {
        next.reject(reason)
      })
      .finally(() => {
        this.resolving -= 1
        this.dequeuePromise()
      })
  }

  enqueuePromise(promise: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject
      })
      this.dequeuePromise()
    })
  }
}
