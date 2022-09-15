import assert from 'assert'

import { buildState, step } from './EntityStateMachineFunctions'

describe('EntityStateMachineFunctions', () => {
  let didExecute = 0
  let didEnter = 0
  let shouldTransition = false

  const StartState = buildState('Start', () => {
    didExecute++
  })
    .addTransition({
      description: "ya goof'd",
      getState: () => GoofState,
      test: (_entity) => false
    })
    .addTransition({
      description: 'fin',
      getState: () => EndState,
      test: (_entity) => shouldTransition
    })
    .addTransition({
      description: 'good jorb',
      getState: () => GoofState,
      test: (_entity) => shouldTransition
    })
    .completeBuild()

  const EndState = buildState(
    'End',
    () => {},
    () => {
      didEnter++
    }
  ).completeBuild()
  const GoofState = buildState('Ya Goofed')

  it('executes start then enters and returns the next state', () => {
    let nextState = step(StartState, 5 as any)
    assert(nextState === StartState, 'should transition to first state that passes test')
    assert(didExecute === 1, 'should execute')
    shouldTransition = true
    nextState = step(StartState, 5 as any)
    assert.equal(didExecute, 2, 'should execute')
    assert(nextState === EndState, 'should transition to first state that passes test')
    assert(didEnter === 1, 'should enter')
  })
})
