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

import assert from 'assert'
import { Runner } from '../'

describe('Runner', () => {
  it('should run mount effect', () => {
    let mount = false

    Runner.runContext('test mount', () => {
      Runner.runEffect(() => {
        mount = true
      }, [])
    })

    assert(mount)
  })

  it('should run effect unmount', () => {
    let mount = false
    let unmount = false

    const context = Runner.runContext('test unmount', () => {
      Runner.runEffect(() => {
        mount = true
        return () => {
          unmount = true
        }
      }, [])
    })

    context.cleanup()

    assert(mount)
    assert(unmount)
  })

  it('should run mount effect inside group', () => {
    let mount = false

    Runner.runContext('test mount in group', () => {
      Runner.runGroup(['hi'], (val) => {
        assert.equal(val, 'hi')
        Runner.runEffect(() => {
          mount = true
        }, [])
      })
    })

    assert(mount)
  })

  it('should run effect unmount inside group', () => {
    let mount = false
    let unmount = false

    const context = Runner.runContext('test unmount in group', () => {
      Runner.runGroup(['hi'], (val) => {
        Runner.runEffect(() => {
          mount = true
          return () => {
            unmount = true
          }
        }, [])
      })
    })

    context.cleanup()

    assert(mount)
    assert(unmount)
  })

  it('should run effect with dependencies', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 1'

    let count = 0

    const runner = () => {
      Runner.runEffect(() => {
        count++
        states.a = entities.a
      }, [entities.a])
    }

    Runner.runContext(context, runner)

    assert.equal(count, 1)
    assert.equal(states.a, undefined)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(count, 2)
    assert.equal(states.a, 1)
  })

  it('should run effect unmount when dependency changes', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 2'

    let mount = 0
    let unmount = 0

    const runner = () => {
      Runner.runEffect(() => {
        states.a = entities.a
        mount++
        return () => {
          unmount++
        }
      }, [entities.a])
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(unmount, 0)
    assert.equal(mount, 1)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(unmount, 1)
    assert.equal(mount, 2)

    entities.a = 2

    Runner.runContext(context, runner)

    assert.equal(states.a, 2)
    assert.equal(unmount, 2)
    assert.equal(mount, 3)
  })

  it('should not run effect when dependencies do not change', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 3'

    let mount = 0
    let unmount = 0

    const runner = () => {
      Runner.runEffect(() => {
        states.a = entities.a
        mount++
        return () => {
          unmount++
        }
      }, [entities.a])
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(mount, 1)
    assert.equal(unmount, 0)

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(mount, 1)
    assert.equal(unmount, 0)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(mount, 2)
    assert.equal(unmount, 1)

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(mount, 2)
    assert.equal(unmount, 1)
  })

  it('should run effect unmount when context is destroyed', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 3'
    let unmount = 0

    const runner = () => {
      Runner.runEffect(() => {
        states.a = entities.a
        return () => {
          unmount++
        }
      }, [entities.a])
    }

    const contextRunner = Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(unmount, 0)

    entities.a = 1

    contextRunner.cleanup()

    assert.equal(unmount, 1)
  })

  it('should run effect with dependencies in group', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 4'

    const runner = () => {
      Runner.runGroup(['hi'], (val) => {
        Runner.runEffect(() => {
          states.a = entities.a
        }, [entities.a])
      })
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
  })

  it('should run effect unmount when dependency changes in group', () => {
    const entities = {} as { a: number }
    const states = {} as { a: number }

    const context = 'test deps 5'

    let mount = 0
    let unmount = 0

    const runner = () => {
      Runner.runGroup(['hi'], (val) => {
        Runner.runEffect(() => {
          states.a = entities.a
          mount++
          return () => {
            unmount++
          }
        }, [entities.a])
      })
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(mount, 1)
    assert.equal(unmount, 0)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(mount, 2)
    assert.equal(unmount, 1)

    entities.a = 2

    Runner.runContext(context, runner)

    assert.equal(states.a, 2)
    assert.equal(mount, 3)
    assert.equal(unmount, 2)
  })

  it('should run multiple effects with dependencies', () => {
    const entities = {} as { a: number; b: number }
    const states = {} as { a: number; b: number }

    const context = 'test deps 6'

    let mountA = 0
    let mountB = 0
    let unmountA = 0
    let unmountB = 0

    const runner = () => {
      Runner.runEffect(() => {
        states.a = entities.a
        mountA++
        console.log('mountA', mountA)
        return () => {
          unmountA++
          console.log('unmountA', unmountA)
        }
      }, [entities.a])

      Runner.runEffect(() => {
        states.b = entities.b
        mountB++
        console.log('mountB', mountB)
        return () => {
          unmountB++
          console.log('unmountB', unmountB)
        }
      }, [entities.b])
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(states.b, undefined)
    assert.equal(mountA, 1)
    assert.equal(mountB, 1)
    assert.equal(unmountA, 0)
    assert.equal(unmountB, 0)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(states.b, undefined)
    assert.equal(mountA, 2)
    assert.equal(mountB, 1)
    assert.equal(unmountA, 1)
    assert.equal(unmountB, 0)

    entities.b = 2

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(states.b, 2)

    assert.equal(mountA, 2)
    assert.equal(mountB, 2)
    assert.equal(unmountA, 1)
    assert.equal(unmountB, 1)

    entities.a = 3

    Runner.runContext(context, runner)

    assert.equal(states.a, 3)
    assert.equal(states.b, 2)
    assert.equal(mountA, 3)
    assert.equal(mountB, 2)
    assert.equal(unmountA, 2)
    assert.equal(unmountB, 1)
  })

  it('should run multiple effects with dependencies in a group', () => {
    const entities = {} as { a: number; b: number }
    const states = {} as { a: number; b: number }

    const context = 'test deps 7'

    let mountA = 0
    let mountB = 0
    let unmountA = 0
    let unmountB = 0

    const runner = () => {
      Runner.runGroup(['hi'], (val) => {
        Runner.runEffect(() => {
          states.a = entities.a
          mountA++
          console.log('mountA', mountA)
          return () => {
            unmountA++
            console.log('unmountA', unmountA)
          }
        }, [entities.a])

        Runner.runEffect(() => {
          states.b = entities.b
          mountB++
          console.log('mountB', mountB)
          return () => {
            unmountB++
            console.log('unmountB', unmountB)
          }
        }, [entities.b])
      })
    }

    Runner.runContext(context, runner)

    assert.equal(states.a, undefined)
    assert.equal(states.b, undefined)
    assert.equal(mountA, 1)
    assert.equal(mountB, 1)
    assert.equal(unmountA, 0)
    assert.equal(unmountB, 0)

    entities.a = 1

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(states.b, undefined)
    assert.equal(mountA, 2)
    assert.equal(mountB, 1)
    assert.equal(unmountA, 1)
    assert.equal(unmountB, 0)

    entities.b = 2

    Runner.runContext(context, runner)

    assert.equal(states.a, 1)
    assert.equal(states.b, 2)

    assert.equal(mountA, 2)
    assert.equal(mountB, 2)
    assert.equal(unmountA, 1)
    assert.equal(unmountB, 1)

    entities.a = 3

    Runner.runContext(context, runner)

    assert.equal(states.a, 3)
    assert.equal(states.b, 2)
    assert.equal(mountA, 3)
    assert.equal(mountB, 2)
    assert.equal(unmountA, 2)
    assert.equal(unmountB, 1)
  })

  it('should run group with multiple changing entries', () => {
    const entities = {} as Record<string, { a: number; b: number }>
    const states = {} as Record<string, { a: number; b: number }>

    const ids = [] as string[]

    const context = 'test deps 8'

    let mount = 0
    let unmount = 0

    const runner = () => {
      Runner.runGroup(ids, (id) => {
        Runner.runEffect(() => {
          mount++
          console.log('mount', mount, id)
          return () => {
            unmount++
            console.log('unmount', unmount, id)
          }
        }, [])

        Runner.runEffect(() => {
          if (!states[id]) states[id] = {} as { a: number; b: number }
          states[id].a = entities[id].a
          console.log('IN EFFECT', id, states)
        }, [entities[id].a])
      })
    }

    Runner.runContext(context, runner)

    assert.equal(Object.keys(states).length, 0)
    assert.equal(mount, 0)
    assert.equal(unmount, 0)

    ids.push('1')
    entities['1'] = { a: 1, b: 2 }

    Runner.runContext(context, runner)

    assert.equal(mount, 1)
    assert.equal(unmount, 0)

    ids.push('2')
    entities['2'] = { a: 10, b: 11 }

    Runner.runContext(context, runner)

    assert.equal(mount, 2)
    assert.equal(unmount, 0)

    entities['1'] = { a: 3, b: 4 }
    entities['2'] = { a: 12, b: 13 }

    Runner.runContext(context, runner)

    assert.equal(states['1'].a, 3)
    assert.equal(states['2'].a, 12)
    assert.equal(mount, 2)
    assert.equal(unmount, 0)

    ids.pop()
    delete entities['2']

    Runner.runContext(context, runner)

    assert.equal(states['1'].a, 3)
    assert.equal(mount, 2)
    assert.equal(unmount, 1)

    ids.unshift('2')
    entities['2'] = { a: 12, b: 13 }

    Runner.runContext(context, runner)

    assert.equal(states['1'].a, 3)
    assert.equal(mount, 3)
    assert.equal(unmount, 1)

    entities['2'] = { a: 20, b: 21 }

    Runner.runContext(context, runner)

    assert.equal(states['1'].a, 3)
    assert.equal(entities['2'].a, 20)
    assert.equal(mount, 3)
    assert.equal(unmount, 1)
  })

  it('should run group and effects together', () => {
    const entities = {} as Record<string, { a: number; b: number }>
    const states = {} as Record<string, { a: number; b: number }>

    const ids = [] as string[]

    const context = 'test deps 9'

    let mount = 0
    let unmount = 0
    let runnerMount = 0
    let runnerUnmount = 0
    let stateChange = 0

    let state = 0

    const runner = () => {
      Runner.runGroup(ids, (id) => {
        Runner.runEffect(() => {
          mount++
          console.log('mount', mount, id)
          return () => {
            unmount++
            console.log('unmount', unmount, id)
          }
        }, [])

        Runner.runEffect(() => {
          if (!states[id]) states[id] = {} as { a: number; b: number }
          states[id].a = entities[id].a
          console.log('IN EFFECT', id, states)
        }, [entities[id].a])
      })

      Runner.runEffect(() => {
        runnerMount++
        console.log('runnerMount', runnerMount)
        return () => {
          runnerUnmount++
          console.log('runnerUnmount', runnerUnmount)
        }
      }, [])

      Runner.runEffect(() => {
        stateChange++
      }, [state])
    }

    Runner.runContext(context, runner)

    assert.equal(Object.keys(states).length, 0)

    state = 1

    Runner.runContext(context, runner)

    assert.equal(runnerMount, 1)
    assert.equal(runnerUnmount, 0)
    assert.equal(mount, 0)
    assert.equal(unmount, 0)
    assert.equal(stateChange, 2)

    ids.push('1')
    entities['1'] = { a: 1, b: 2 }

    Runner.runContext(context, runner)

    assert.equal(runnerMount, 1)
    assert.equal(runnerUnmount, 0)
    assert.equal(stateChange, 2)
    assert.equal(mount, 1)
    assert.equal(unmount, 0)
  })

  it('should run nested groups', () => {
    const ids = [] as string[]
    const ids2 = [] as string[]

    const context = 'test deps 10'

    let mount = 0
    let unmount = 0

    const runner = () => {
      Runner.runGroup(ids, (id) => {
        Runner.runGroup(ids2, (id2) => {
          Runner.runEffect(() => {
            mount++
            console.log('mount', mount, id)
            return () => {
              unmount++
              console.log('unmount', unmount, id)
            }
          }, [])
        })
      })
    }

    Runner.runContext(context, runner)

    assert.equal(mount, 0)
    assert.equal(unmount, 0)

    ids.push('1')

    Runner.runContext(context, runner)

    assert.equal(mount, 0)
    assert.equal(unmount, 0)

    ids2.push('a')

    Runner.runContext(context, runner)

    assert.equal(mount, 1)
    assert.equal(unmount, 0)

    ids.push('2')

    Runner.runContext(context, runner)

    assert.equal(mount, 2)
    assert.equal(unmount, 0)

    ids2.push('b')

    Runner.runContext(context, runner)

    assert.equal(mount, 4)
    assert.equal(unmount, 0)

    ids.length = 0

    Runner.runContext(context, runner)

    assert.equal(mount, 4)
    assert.equal(unmount, 4)
  })
})
