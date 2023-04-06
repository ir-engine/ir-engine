import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MeshBasicMaterial } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent, VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ComputedTransformComponent } from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { XRUIComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@etherealengine/engine/src/xrui/functions/createTransitionState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { ObjectFitFunctions } from '@etherealengine/engine/src/xrui/functions/ObjectFitFunctions'
import { defineState, getMutableState, getState, startReactor, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import type { WebLayer3D } from '@etherealengine/xrui'

export const WarningUIState = defineState({
  name: 'WarningUIState',
  initial: {
    open: false,
    title: '',
    body: '',
    action: null as null | (() => void),
    timeRemaining: 0
  }
})

export const WarningUIService = {
  openWarning: (args: { title: string; body: string; timeout?: number; action?: () => void }) => {
    const state = getMutableState(WarningUIState)
    state.open.set(true)
    state.title.set(args.title)
    state.body.set(args.body)
    state.timeRemaining.set(args.timeout ?? 0)
  },
  closeWarning: () => {
    const state = getMutableState(WarningUIState)
    state.open.set(false)
  }
}

const WarningSystemXRUI = function () {
  const { t } = useTranslation()

  const state = useHookstate(getMutableState(WarningUIState))
  const { title, body, timeRemaining } = state.value

  const onClose = () => {
    const action = getState(WarningUIState).action
    if (action) action()
  }

  return (
    <div xr-layer="true" className={'z-1'} style={{ zIndex: '-1' }}>
      <div
        xr-layer="true"
        className={'pl-6 pr-8 max-w-sm'}
        style={{
          paddingLeft: '24px',
          paddingRight: '32px',
          maxWidth: '400px',
          background: 'var(--popupBackground)',
          color: 'var(--textColor)',
          borderRadius: '20px',
          padding: '12px'
        }}
      >
        <div
          xr-layer="true"
          className={'flex justify-space-between align-center'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div />
          <div xr-layer="true" className={'font-size 24px'} style={{ fontSize: '24px' }}>
            {title}
          </div>
          <IconButton
            xr-layer="true"
            aria-label="close"
            className={'bg lightgrey'}
            style={{ backgroundColor: 'lightgrey' }}
            onClick={onClose}
            size="large"
            icon={<Icon type="Close" />}
          />
        </div>
        <div xr-layer="true" className={'font-size 16px center'} style={{ fontSize: '16px', textAlign: 'center' }}>
          {body}
          {timeRemaining > 0 && (
            <>
              <div xr-layer="true">
                <span xr-layer="true">{timeRemaining}</span> {t('common:alert.seconds')}
              </div>
              <div className={'margin-top 20px font-size 12px'} style={{ marginTop: '20px', fontSize: '12px' }}>
                {t('common:alert.cancelCountdown')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function WarningUISystem() {
  const transitionPeriodSeconds = 0.2
  const transition = createTransitionState(transitionPeriodSeconds, 'OUT')

  const ui = createXRUI(WarningSystemXRUI)
  removeComponent(ui.entity, VisibleComponent)

  const reactor = startReactor(function () {
    const state = useHookstate(getMutableState(WarningUIState))

    useEffect(() => {
      if (state.open.value) {
        transition.setState('IN')
      } else {
        transition.setState('OUT')
      }
    }, [state.open])

    return null
  })

  const state = getState(WarningUIState)

  addComponent(ui.entity, NameComponent, 'Warning XRUI')

  let accumulator = 0

  const execute = () => {
    if (state.timeRemaining > 0) {
      accumulator += Engine.instance.deltaSeconds
      if (state.open && accumulator > 1) {
        const timeRemaining = Math.max(0, state.timeRemaining - 1)
        getMutableState(WarningUIState).timeRemaining.set(timeRemaining)
        if (timeRemaining === 0) {
          const action = state.action
          if (action) action()
          WarningUIService.closeWarning()
        }
        accumulator = 0
      }
    }

    if (transition.state === 'OUT' && transition.alpha === 0) {
      removeComponent(ui.entity, ComputedTransformComponent)
      return
    }

    const xrui = getComponent(ui.entity, XRUIComponent)

    if (transition.state === 'IN') {
      setComponent(ui.entity, ComputedTransformComponent, {
        referenceEntity: Engine.instance.cameraEntity,
        computeFunction: () => {
          ObjectFitFunctions.attachObjectInFrontOfCamera(ui.entity, 0.3, 0.2)
        }
      })
    }

    transition.update(Engine.instance.deltaSeconds, (opacity) => {
      xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
        const mat = layer.contentMesh.material as MeshBasicMaterial
        mat.opacity = opacity
        mat.visible = opacity > 0
        layer.visible = opacity > 0
      })
      setVisibleComponent(ui.entity, opacity > 0)
    })
  }

  const cleanup = async () => {
    removeEntity(ui.entity)
    await reactor.stop()
  }

  return { execute, cleanup }
}
