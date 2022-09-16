import assert from 'assert'
import { noop } from 'lodash'

import { buildState, step } from './EntityStateMachineFunctions'

describe('EntityStateMachineFunctions', () => {
  let didExecute = 0
  let didEnter = 0
  let didExit = 0
  let shouldTransition = false

  const StartState = buildState(
    'Start',
    () => {
      didExecute++
    },
    noop,
    () => {
      didExit++
    }
  )
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

  it('executes start, exits it, then enters and returns the next state', () => {
    let nextState = step(StartState, 5 as any)
    assert(nextState === StartState, 'should transition to first state that passes test')
    assert(didExecute === 1, 'should execute')
    assert(didExit === 0, 'should not yet exit')
    assert(didEnter === 0, 'should not yet enter')
    shouldTransition = true
    nextState = step(StartState, 5 as any)
    assert.equal(didExecute, 2, 'should execute')
    assert(nextState === EndState, 'should transition to first state that passes test')
    assert.equal(didExit, 1, 'should exit')
    assert.equal(didEnter, 1, 'should enter')
  })
})
