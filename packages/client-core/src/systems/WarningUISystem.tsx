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
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent, VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ComputedTransformComponent } from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { XRUIComponent, XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@etherealengine/engine/src/xrui/functions/createTransitionState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { ObjectFitFunctions } from '@etherealengine/engine/src/xrui/functions/ObjectFitFunctions'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import type { WebLayer3D } from '@etherealengine/xrui'

export const WarningUIState = defineState({
  name: 'WarningUIState',
  initial: {
    open: false,
    title: '',
    body: '',
    timeRemaining: 0,
    action: null as null | ((clicked: boolean) => void)
  }
})

const executeAction = async (timeout: boolean) => {
  const action = getState(WarningUIState).action
  if (action) action(timeout)
  WarningUIService.closeWarning()
}

export const WarningUIService = {
  openWarning: async (args: { title: string; body: string; timeout?: number; action?: (timeout: boolean) => void }) => {
    const state = getMutableState(WarningUIState)
    state.open.set(true)
    state.title.set(args.title)
    state.body.set(args.body)
    state.timeRemaining.set(args.timeout ?? -1)
    state.merge({ action: args.action ?? null })
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

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto"></link>
      <div xr-layer="true" className={'z-1'} style={{ zIndex: '-1', fontFamily: 'Roboto' }}>
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
          onClick={() => executeAction(false)}
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
            <div
              xr-layer="true"
              className={'font-size 20px'}
              style={{ fontSize: '24px', width: '100%', textAlign: 'center' }}
            >
              {title}
            </div>
            {/* <IconButton
            xr-layer="true"
            aria-label="close"
            className={'bg lightgrey'}
            style={{ backgroundColor: 'lightgrey' }}
            onClick={executeAction}
            size="large"
            icon={<Icon type="Close" />}
          /> */}
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
    </>
  )
}

export const WarningUISystemState = defineState({
  name: 'WarningUISystemState',
  initial: () => {
    const transitionPeriodSeconds = 0.2
    const transition = createTransitionState(transitionPeriodSeconds, 'OUT')

    const ui = createXRUI(WarningSystemXRUI)
    removeComponent(ui.entity, VisibleComponent)
    addComponent(ui.entity, NameComponent, 'Warning XRUI')
    setComponent(ui.entity, XRUIInteractableComponent)

    return {
      ui,
      transition
    }
  }
})

function TransitionReactor() {
  const state = useHookstate(getMutableState(WarningUIState))

  useEffect(() => {
    if (state.open.value) {
      getState(WarningUISystemState).transition.setState('IN')
    } else {
      getState(WarningUISystemState).transition.setState('OUT')
    }
  }, [state.open])

  return null
}

let accumulator = 0

const execute = () => {
  const state = getState(WarningUIState)
  const { transition, ui } = getState(WarningUISystemState)

  if (state.timeRemaining > 0) {
    accumulator += Engine.instance.deltaSeconds
    if (state.open && accumulator > 1) {
      const timeRemaining = Math.max(0, state.timeRemaining - 1)
      getMutableState(WarningUIState).timeRemaining.set(timeRemaining)
      if (timeRemaining === 0) {
        executeAction(true)
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

const reactor = () => {
  useEffect(() => {
    return () => {
      const ui = getState(WarningUISystemState).ui
      removeEntity(ui.entity)
    }
  }, [])
  return <TransitionReactor />
}

export const WarningUISystem = defineSystem({
  uuid: 'ee.client.WarningUISystem',
  execute,
  reactor
})
