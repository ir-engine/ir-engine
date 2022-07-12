import assert from 'assert'
import proxyquire from 'proxyquire'

import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { createEngine } from '../../initializeEngine'
import { GamepadButtons, XRAxes } from '../../input/enums/InputEnums'
import { InputType } from '../../input/enums/InputType'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

describe('XRSystem Tests', async () => {
  let xrSystem

  beforeEach(async () => {
    createEngine()

    const assetLoaderStub = {
      AssetLoader: {
        loadAsync() {
          return new Promise((resolve, reject) => {
            resolve(0)
          })
        }
      }
    } as any

    const { default: XRSystem } = proxyquire('./XRSystem', {
      '../../assets/classes/AssetLoader': assetLoaderStub
    })

    xrSystem = await XRSystem(Engine.instance.currentWorld)
  })

  it('check gamepad values copied into inputState', async () => {
    const inputSource = {
      gamepad: {
        buttons: [{ pressed: false }, { pressed: true }],
        axes: [1, 0.04]
      },
      mapping: 'xr-standard',
      handedness: 'left'
    }
    EngineRenderer.instance.xrManager = { isPresenting: true } as any
    Engine.instance.xrFrame = { session: { inputSources: [inputSource] } } as any

    xrSystem()

    const lTriggerState = Engine.instance.currentWorld.inputState.get(GamepadButtons.LTrigger)
    assert(!lTriggerState)
    const lBumperState = Engine.instance.currentWorld.inputState.get(GamepadButtons.LBumper)
    assert(lBumperState?.type === InputType.BUTTON)
    assert(lBumperState?.value[0] === BinaryValue.ON)
    assert(lBumperState?.lifecycleState === LifecycleValue.Started)

    const lAxisState = Engine.instance.currentWorld.inputState.get(XRAxes.Left)
    assert(lAxisState)
    assert(lAxisState.type === InputType.TWODIM)
    assert(lAxisState.value[0] === 1)
    assert(lAxisState.value[1] === 0)
    assert(lAxisState.lifecycleState === LifecycleValue.Started)
  })
})
