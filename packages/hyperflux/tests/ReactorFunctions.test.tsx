import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect, useLayoutEffect } from 'react'
import { createHyperStore, disposeStore, hookstate, startReactor, useHookstate } from '..'

describe('ReactorFunctions', () => {
  beforeEach(() => {
    createHyperStore({
      getDispatchId: () => '0',
      getDispatchTime: () => 0
    })
  })

  afterEach(() => {
    return disposeStore()
  })

  it('should be able to run effects asynchronously', async () => {
    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    assert.equal(renderCount, 0) // before render
    assert.equal(layoutEffectCount, 0) // before layout effect run
    assert.equal(effectCount, 0) // before effect run

    await reactorRoot.promise

    // empty tag to allow scheduler to render
    const tag = <></>

    const { rerender, unmount } = render(tag)

    assert.equal(renderCount, 1) // rendered
    assert.equal(layoutEffectCount, 1) // layout effect run
    assert.equal(effectCount, 0) // async effect did not run

    await act(() => rerender(tag))

    assert.equal(renderCount, 1) // no change if state unchanged render
    assert.equal(layoutEffectCount, 1) // no change if state unchanged layout effect run
    assert.equal(effectCount, 1) // no change if state unchanged effect run

    effectTrigger.set(1)

    await act(() => rerender(tag))

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)

    unmount()
  })

  it('should be able to run effects synchronously', async () => {
    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    await reactorRoot.promise

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)

    reactorRoot.run(true)

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)

    effectTrigger.set(1)

    reactorRoot.run(true)

    assert.equal(renderCount, 3)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)

    await reactorRoot.stop()
  })

  it('should not update unrelated reactor when forcing run synchronously', async () => {
    createHyperStore({
      getDispatchId: () => '0',
      getDispatchTime: () => 0
    })

    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0
    let render2Count = 0
    let layoutEffect2Count = 0
    let effect2Count = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    const reactorRoot2 = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      render2Count++

      useLayoutEffect(() => {
        layoutEffect2Count++
      }, [trigger])

      useEffect(() => {
        effect2Count++
      }, [trigger])

      return null
    })

    await reactorRoot.promise
    await reactorRoot2.promise

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)
    assert.equal(render2Count, 1)
    assert.equal(layoutEffect2Count, 1)
    assert.equal(effect2Count, 1)

    reactorRoot.run(true)

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)
    assert.equal(render2Count, 1)
    assert.equal(layoutEffect2Count, 1)
    assert.equal(effect2Count, 1)

    effectTrigger.set(1)

    reactorRoot.run(true)

    assert.equal(renderCount, 3)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)
    assert.equal(render2Count, 1)
    assert.equal(layoutEffect2Count, 1)
    assert.equal(effect2Count, 1)

    await reactorRoot.stop()
    await reactorRoot2.stop()
  })

  it('should be able to run nested effects synchronously', async () => {
    let renderCount = 0
    let nestedRenderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate({} as Record<string, number>)

    const NestedReactor = ({ label }: { label: string }) => {
      const trigger = useHookstate(effectTrigger[label])
      nestedRenderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    }

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      return (
        <>
          {trigger.keys.map((key) => {
            return <NestedReactor key={key} label={key} />
          })}
        </>
      )
    })

    await reactorRoot.promise

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 0)
    assert.equal(nestedRenderCount, 0)
    assert.equal(effectCount, 0)

    effectTrigger.set({ a: 0 })

    reactorRoot.run(true)

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 1)
    assert.equal(nestedRenderCount, 1)
    assert.equal(effectCount, 1)

    effectTrigger.a.set(1)

    reactorRoot.run(true)

    assert.equal(renderCount, 3)
    assert.equal(layoutEffectCount, 2)
    assert.equal(nestedRenderCount, 2)
    assert.equal(effectCount, 2)

    effectTrigger.b.set(0)

    reactorRoot.run(true)

    assert.equal(renderCount, 4)
    assert.equal(layoutEffectCount, 3)
    assert.equal(nestedRenderCount, 4)
    assert.equal(effectCount, 3)
  })
})
