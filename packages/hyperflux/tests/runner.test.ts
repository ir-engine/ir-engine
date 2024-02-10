import * as assert from 'assert'
import { Runner } from '../'

const executeContext = 'testContext' // will be a system definition uuid

// quick ecs impl lol
let entities = {} as Record<number, { a: number; b: number } | undefined>

let states = {} as Record<number, { a: number; b: number } | undefined>

const updateEntity = (eid) => {
  const data = entities[eid]!

  Runner.runEffect(() => {
    console.log('a changed', eid, data.a)
    states[eid] = { a: data.a, b: data.b }

    return () => {
      console.log('a cleanup', eid)
      delete states[eid]
    }
  }, [data.a])

  Runner.runEffect(() => {
    console.log('b data changed', eid, data.b)
    states[eid] = { a: data.a, b: data.b }

    return () => {
      console.log('b cleanup', eid)
      delete states[eid]
    }
  }, [data.b])

  Runner.runGroup(['hi'], () => {
    Runner.runEffect(() => {
      console.log('hi changed', eid)
      states[eid] = { a: data.a, b: data.b }

      return () => {
        console.log('hi cleanup', eid)
        delete states[eid]
      }
    }, [])
  })
}

const updateEntities = () => {
  const ents = Object.keys(entities).filter(Boolean)
  Runner.runGroup(ents, updateEntity)
}

const execute = () => {
  Runner.runContext(executeContext, updateEntities)
  console.log('')
}

describe('Runner', () => {
  it('should run effects', () => {
    execute()
    entities[0] = { a: 3, b: 2 }
    entities[1] = { a: 10, b: 11 }

    assert.deepEqual(states, {})
    execute()

    assert.deepEqual(states, {
      0: { a: 3, b: 2 },
      1: { a: 10, b: 11 }
    })

    console.log('setting 0 a to 4')
    entities[0].a = 4
    execute()

    assert.deepEqual(states, {
      0: { a: 4, b: 2 },
      1: { a: 10, b: 11 }
    })

    console.log('setting 0 b to 5')
    entities[1].b = 0
    execute()

    assert.deepEqual(states, {
      0: { a: 4, b: 2 },
      1: { a: 10, b: 0 }
    })

    console.log('deleting 1')
    delete entities[1]
    execute()

    assert.deepEqual(states, {
      0: { a: 4, b: 2 }
    })
  })
})
