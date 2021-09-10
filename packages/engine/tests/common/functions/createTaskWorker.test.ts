import {
  stringifyFunctionBody,
  superviseOnInterval,
  startTaskLifecycle,
  TaskContext,
  createWorkerBody
} from '../../../src/common/functions/createTaskWorker'

test('stringifyFunctionBody', () => {
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

  function dependant() {
    return dependency()
  }

  expect(stringifyFunctionBody(named)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(anonymous)).toBe('return Math.PI;')
  expect(() => stringifyFunctionBody(lambda)).toThrow()
  expect(stringifyFunctionBody(arrow)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(method)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(generator)).toBe('yield Math.PI;')

  expect(stringifyFunctionBody(dependant, {dependency: lambda, object: {color: 'blue'}})).toBe(`const dependency = () => Math.PI;
const object = {"color":"blue"};
return dependency();`)
})

jest.useFakeTimers()

describe('createWorkerBody', () => {
  const intervalDuration = 200
  let context: TaskContext, messageQueue: [],
    createTaskHandler: () => (arg: any) => void,
    taskHandler: (arg: any) => void,
    taskContext: TaskContext,
    getTaskContext: () => TaskContext,
    prepareEnv: () => void

  beforeEach(() => {
    context = {} as any
    messageQueue = []
    prepareEnv = jest.fn()
    taskHandler = jest.fn(function () {
      jest.advanceTimersByTime(10)
      ;(this as TaskContext).postResult('🍔')
    })
    createTaskHandler = jest.fn(() => taskHandler)
    taskContext = {
      onmessage: () => {},
      postResult: jest.fn()
    }
    getTaskContext = () => taskContext
    const body = createWorkerBody(messageQueue, createTaskHandler, getTaskContext, intervalDuration)
    body.call(context)
    context.onmessage({ data: { id: 'burger', args: ['cheese'] } } as any)
  })

  it('prepares the enviroment once before handling the first task', () => {
    jest.advanceTimersByTime(intervalDuration)
    expect(createTaskHandler).toHaveBeenCalledTimes(1)
    context.onmessage({ data: { id: 'burger', args: ['cheese'] } } as any)
    jest.advanceTimersByTime(intervalDuration)
    expect(createTaskHandler).toHaveBeenCalledTimes(1)
  })
  it('adds incoming messages to a queue', () => {
    expect(messageQueue).toEqual([{ data: { id: 'burger', args: ['cheese'] } }])
  })

  it('periodically checks for new messages and calls the task handler', () => {
    jest.advanceTimersByTime(intervalDuration)
    expect(taskHandler).toHaveBeenCalledWith('cheese')
  })

  it('removes messages from the queue after processing them', () => {
    jest.advanceTimersByTime(intervalDuration)
    expect(messageQueue).toEqual([])
  })

  it('gives task handler a context with a method for posting results', () => {
    jest.advanceTimersByTime(intervalDuration)
    expect(taskContext.postResult).toHaveBeenCalledTimes(1)
    expect(taskContext.postResult).toHaveBeenCalledWith('🍔')
  })

  it('finishes processing all messages no matter what', () => {
    for(let i = 0; i < 99; i++) {
      context.onmessage({data: {id: 'burger', args: []}} as any)
    }
    jest.advanceTimersByTime(intervalDuration)
    for(let i = 0; i < 100; i++) {
      context.onmessage({data: {id: 'burger', args: []}} as any)
    }
    jest.advanceTimersByTime(intervalDuration)
    expect(taskHandler).toHaveBeenCalledTimes(200)
  })
})

describe('superviseOnInterval', () => {
  it('returns promise that resolves after result is added to map for given task', async () => {
    const map = new Map()
    const thenCallback = jest.fn()
    const totalTime = 700
    const intervalDuration = 200

    const promise = superviseOnInterval(map, 'burger', 200).then(thenCallback)

    setTimeout(() => {
      map.set('burger', '🍔')
    }, totalTime)

    jest.advanceTimersByTime(intervalDuration)

    expect(thenCallback).not.toHaveBeenCalled()

    jest.advanceTimersByTime((Math.ceil(totalTime / intervalDuration) - 1) * intervalDuration)

    // Jest's fake timers don't effect promises
    await promise

    expect(thenCallback).toHaveBeenCalledWith('🍔')

    jest.advanceTimersByTime(intervalDuration)

    expect(thenCallback).toHaveBeenCalledTimes(1)
  })
})

describe('startTaskLifecycle', () => {
  const totalTime = 700
  let worker: Worker, map: Map<string, string>, promise
  beforeEach(() => {
    worker = { postMessage: jest.fn() } as any
    map = new Map([['burger', '🍔']])
    promise = startTaskLifecycle(
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
    expect(worker.postMessage).toHaveBeenCalledWith({ id: 'burger', args: ['cheese'] })
  })

  it('cleans up result', async () => {
    jest.advanceTimersByTime(totalTime)
    await promise
    expect(map.has('burger')).toBe(false)
  })
})
