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

import { act, renderHook } from '@testing-library/react'
import assert from 'assert'
import { afterEach } from 'mocha'

import { createState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { createEngine } from '../../initializeEngine'
import { AvatarID } from '../../schemas/user/avatar.schema'
import { userPath } from '../../schemas/user/user.schema'
import { EventDispatcher } from '../classes/EventDispatcher'
import { useFind, useGet, useMutation } from './FeathersHooks'

describe('FeathersHooks', () => {
  beforeEach(() => {
    createEngine()
    const db = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ]
    const eventDispatcher = new EventDispatcher()
    ;(Engine.instance.api as any) = {
      service: () => {
        return {
          find: () => {
            return new Promise((resolve) => {
              resolve(
                JSON.parse(
                  JSON.stringify({
                    data: db,
                    limit: 10,
                    skip: 0,
                    total: db.length
                  })
                )
              )
            })
          },
          get: (id) => {
            return new Promise((resolve) => {
              const data = db.find((item) => item.id === id)
              console.log('get', id, data)
              resolve(data ? JSON.parse(JSON.stringify(data)) : null)
            })
          },
          create: (data) => {
            return new Promise((resolve) => {
              const newEntry = {
                id: `${db.length + 1}`,
                name: data.name
              }
              db.push(newEntry)
              resolve({ ...newEntry })
              eventDispatcher.dispatchEvent({
                type: 'created',
                ...newEntry
              })
            })
          },
          update: (id, data) => {
            return new Promise((resolve) => {
              db.find((item) => item.id === id)!.name = data.name
              resolve({
                id,
                name: data.name
              })
              eventDispatcher.dispatchEvent({
                type: 'updated',
                id,
                name: data.name
              })
            })
          },
          patch: (id, data) => {
            return new Promise((resolve) => {
              db.find((item) => item.id === id)!.name = data.name
              resolve(
                JSON.parse(
                  JSON.stringify({
                    id,
                    name: data.name
                  })
                )
              )
              eventDispatcher.dispatchEvent({
                type: 'patched',
                id,
                name: data.name
              })
            })
          },
          remove: (id) => {
            return new Promise((resolve) => {
              const item = db.find((item) => item.id === id)
              db.splice(
                db.findIndex((item) => item.id === id),
                1
              )
              resolve(
                JSON.parse(
                  JSON.stringify({
                    id
                  })
                )
              )
              eventDispatcher.dispatchEvent({
                type: 'removed',
                ...item
              })
            })
          },
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('useFind', () => {
    it('should populate data', async () => {
      const { result, rerender } = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data.length, 2)
      assert.strictEqual(data[0].name, 'John')
      assert.strictEqual(data[1].name, 'Jane')
    })

    it('should return the data with params', async () => {
      const { result, rerender } = renderHook(() => {
        return useFind(userPath, { query: { name: 'John' } })
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data?.[0]?.name, 'John')
    })
  })

  describe('useGet', () => {
    it('should get entry', async () => {
      const { result, rerender } = renderHook(() => {
        return useGet(userPath, '1')
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data?.name, 'John')
    })
  })

  describe('useMutation', () => {
    it('should create data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.create({ name: 'Jack', avatarId: '' as AvatarID, isGuest: true, scopes: [] })
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data.length, 3)
      assert.strictEqual(data[2]?.name, 'Jack')
    })

    // it('should update data', async () => {
    //   const { result, rerender } = renderHook(() => {
    //     return useMutation(userPath)
    //   })
    //   await act(() => {
    //     rerender()
    //   })
    //   await act(() => {
    //     result.current.update('1', { name: 'Jack' } as any)
    //   })
    //   const findHook = renderHook(() => {
    //     return useFind(userPath)
    //   })
    //   await act(() => {
    //     findHook.rerender()
    //   })
    //   const { data } = findHook.result.current
    //   assert.strictEqual(data[0]?.name, 'Jack')
    // })

    it('should patch data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.patch('1', { name: 'Jack' })
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data[0]?.name, 'Jack')
    })

    it('should remove data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.remove('1')
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data.length, 1)
    })
  })

  describe('can use listeners', () => {
    describe('on created', () => {
      it('should populate find query', async () => {
        const result = createState({} as any)
        const { rerender } = renderHook(() => {
          const data = useFind(userPath)
          useEffect(() => {
            result.set(data)
          }, [data.data.length])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api
            .service(userPath)
            .create({ name: 'Jack', avatarId: '' as AvatarID, isGuest: true, scopes: [] })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data.length, 3)
        assert.strictEqual(result.value.data[2]?.name, 'Jack')
      })

      it('should populate get query', async () => {
        const result = createState({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '3')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api
            .service(userPath)
            .create({ name: 'Jack', avatarId: '' as AvatarID, isGuest: true, scopes: [] })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data?.name, 'Jack')
      })
    })

    // describe('on updated', () => {
    //   it('should populate data', async () => {
    //     const { result, rerender } = renderHook(() => {
    //       return useFind(userPath)
    //     })
    //     await act(() => {
    //       rerender()
    //     })
    //     await act(() => {
    //       Engine.instance.api.service(userPath).update('1', { name: 'Jack' })
    //     })
    //     await act(() => {
    //       rerender()
    //     })
    //     assert.strictEqual(result.current.data[0]?.name, 'Jack')
    //   })

    //   it('should populate get query', async () => {
    //     const result = createState({} as any)
    //     const { rerender } = renderHook(() => {
    //       const data = useGet(userPath, '1')
    //       useEffect(() => {
    //         result.set(data)
    //       }, [data.data?.name])
    //     })
    //     await act(() => {
    //       rerender()
    //     })
    //     await act(() => {
    //       Engine.instance.api.service(userPath).update('1', { name: 'Jack' })
    //     })
    //     await act(() => {
    //       rerender()
    //     })
    //     assert.strictEqual(result.value.data?.name, 'Jack')
    //   })
    // })

    describe('on patched', () => {
      it('should populate data', async () => {
        const { result, rerender } = renderHook(() => {
          return useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api.service(userPath).patch('1', { name: 'Jack' })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.current.data[0]?.name, 'Jack')
      })

      it('should populate get query', async () => {
        const result = createState({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '1')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api.service(userPath).patch('1', { name: 'Jack' })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data?.name, 'Jack')
      })
    })

    describe('on removed', () => {
      it('should populate data', async () => {
        const { result, rerender } = renderHook(() => {
          return useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api.service(userPath).remove('1')
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.current.data.length, 1)
      })

      it('should populate get query', async () => {
        const result = createState({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '1')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          Engine.instance.api.service(userPath).remove('1')
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data, null)
      })
    })
  })
})
