import {
  stringifyFunctionBody,
  superviseOnInterval,
  startTaskLifecycle,
  TaskContext,
  createWorkerBody
} from '../../../src/common/functions/createTaskWorker'
import sinon, { SinonFakeTimers, SinonSpy } from 'sinon'
import assert from 'assert'

describe('stringifyFunctionBody', () => {
  function named() {
    return Math.PI
  }
  const anonymous = function () {
    return Math.PI
  }
  // not supported
  const lambda = () => Math.PI
  const arrow = () => {
    return Math.PI
  }
  function* generator() {
    yield Math.PI
  }
  const method = {
    method() {
      return Math.PI
    }
  }.method

  const dependency = lambda

  function dependant() {
    return dependency()
  }

  it('stringifies all sorts of functions and just returns their body', () => {
    assert.equal(stringifyFunctionBody(named), 'return Math.PI;')
    assert.equal(stringifyFunctionBody(anonymous), 'return Math.PI;')
    assert.throws(() => stringifyFunctionBody(lambda))
    assert(stringifyFunctionBody(arrow), 'return Math.PI;')
    assert(stringifyFunctionBody(method), 'return Math.PI;')
    assert(stringifyFunctionBody(generator), 'yield Math.PI;')
  })

  it('includes external dependencies, if any', () => {
    assert.equal(
      stringifyFunctionBody(dependant, { dependency, object: { color: 'blue' } }),
      `const dependency = () => Math.PI;
const object = {"color":"blue"};
return dependency();`
    )
  })
})

describe('createWorkerBody', () => {
  const intervalDuration = 200
  let context: TaskContext,
    messageQueue: [],
    createTaskHandler: () => (arg: any) => void,
    createTaskHandlerSpy: SinonSpy,
    taskHandler: (arg: any) => void,
    taskHandlerSpy: SinonSpy,
    taskContext: TaskContext,
    getTaskContext: () => TaskContext,
    clock: SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    context = {} as any
    messageQueue = []
    taskHandlerSpy = taskHandler = sinon.spy(function () {
      clock.tick(10)
      ;(this as TaskContext).postResult('🍔')
    })
    createTaskHandlerSpy = createTaskHandler = sinon.spy(() => {
      return taskHandler
    })
    taskContext = {
      onmessage: () => {},
      postResult: sinon.spy()
    }
    getTaskContext = () => taskContext
    const body = createWorkerBody(messageQueue, createTaskHandler, getTaskContext, intervalDuration)
    body.call(context)
    context.onmessage({ data: { id: 'burger', args: ['cheese'] } } as any)
  })

  it('prepares the enviroment once before handling the first task', () => {
    clock.tick(intervalDuration)
    assert(createTaskHandlerSpy.calledOnce)
    context.onmessage({ data: { id: 'burger', args: ['cheese'] } } as any)
    clock.tick(intervalDuration)
    assert(createTaskHandlerSpy.calledOnce)
  })
  it('adds incoming messages to a queue', () => {
    assert.deepEqual(messageQueue, [{ data: { id: 'burger', args: ['cheese'] } }])
  })

  it('periodically checks for new messages and calls the task handler', () => {
    clock.tick(intervalDuration)
    assert(taskHandlerSpy.calledWith('cheese'))
  })

  it('removes messages from the queue after processing them', () => {
    clock.tick(intervalDuration)
    assert.deepEqual(messageQueue, [])
  })

  it('gives task handler a context with a method for posting results', () => {
    clock.tick(intervalDuration)
    const postResultSpy = (taskContext.postResult as SinonSpy)
    assert(postResultSpy.calledOnce)
    assert(postResultSpy.calledWith('🍔'))
  })

  it('finishes processing all messages no matter what', () => {
    for (let i = 0; i < 99; i++) {
      context.onmessage({ data: { id: 'burger', args: [] } } as any)
    }
    clock.tick(intervalDuration)
    for (let i = 0; i < 100; i++) {
      context.onmessage({ data: { id: 'burger', args: [] } } as any)
    }
    clock.tick(intervalDuration)
    assert.equal(taskHandlerSpy.callCount, 200)
  })
})

describe('superviseOnInterval', () => {
  let clock: SinonFakeTimers
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })
  it('returns promise that resolves after result is added to map for given task', async () => {
    const map = new Map()
    const thenCallback = sinon.spy()
    const totalTime = 700
    const intervalDuration = 200

    superviseOnInterval(map, 'burger', 200).then(thenCallback)

    setTimeout(() => {
      map.set('burger', '🍔')
    }, totalTime)

    clock.tick(intervalDuration)

    assert(thenCallback.notCalled)

    // Allow promise to resolve
    await clock.tickAsync((Math.ceil(totalTime / intervalDuration) - 1) * intervalDuration)

    assert(thenCallback.calledWith('🍔'))

    clock.tick(intervalDuration)

    assert(thenCallback.calledOnce)
  })
})

describe('startTaskLifecycle', () => {
  const totalTime = 700
  let worker: Worker, map: Map<string, string>, clock: SinonFakeTimers
  beforeEach(() => {
    clock = sinon.useFakeTimers()
    worker = { postMessage: sinon.spy() } as any
    map = new Map([['burger', '🍔']])
    startTaskLifecycle(
      worker,
      map,
      'burger',
      ['cheese'],
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve('🍔')
          }, totalTime)
        })
    )
  })
  it('posts message to worker', () => {
    assert((worker.postMessage as SinonSpy).calledWith({ id: 'burger', args: ['cheese'] }))
  })

  it('cleans up result', async () => {
    await clock.tickAsync(totalTime)
    assert(!map.has('burger'))
  })
})
