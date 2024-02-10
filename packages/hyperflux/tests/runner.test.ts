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
