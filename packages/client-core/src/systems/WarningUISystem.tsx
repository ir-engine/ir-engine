/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MeshBasicMaterial } from 'three'

import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { ObjectFitFunctions } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import type { WebLayer3D } from '@ir-engine/xrui'

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

  const state = useMutableState(WarningUIState)
  const { title, body, timeRemaining } = state.value

  return (
    <>
      <div xr-layer="true" className={'z-1'} style={{ zIndex: '-1', fontFamily: 'Roboto, sans-serif' }}>
        <div
          xr-layer="true"
          className={'max-w-sm pl-6 pr-8'}
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
            className={'justify-space-between align-center flex'}
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

    return {
      ui: null as null | ReturnType<typeof createXRUI>,
      transition
    }
  }
})

function TransitionReactor() {
  const state = useMutableState(WarningUIState)

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
  const { transition, ui } = getState(WarningUISystemState)
  if (!ui) return

  const state = getState(WarningUIState)

  const deltaSeconds = getState(ECSState).deltaSeconds

  if (state.timeRemaining > 0) {
    accumulator += deltaSeconds
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
      referenceEntities: [Engine.instance.viewerEntity],
      computeFunction: () => {
        const camera = getComponent(Engine.instance.viewerEntity, CameraComponent)
        const distance = camera.near * 1.1 // 10% in front of camera
        ObjectFitFunctions.attachObjectInFrontOfCamera(ui.entity, 0.3, distance)
      }
    })
  }

  transition.update(deltaSeconds, (opacity) => {
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
      mat.visible = opacity > 0
      layer.visible = opacity > 0
    })
    setVisibleComponent(ui.entity, opacity > 0)
  })
}

const Reactor = () => {
  useEffect(() => {
    const ui = createXRUI(WarningSystemXRUI)
    removeComponent(ui.entity, VisibleComponent)
    setComponent(ui.entity, NameComponent, 'Warning XRUI')
    getMutableState(WarningUISystemState).ui.set(ui)

    return () => {
      removeEntity(ui.entity)
    }
  }, [])
  return <TransitionReactor />
}

export const WarningUISystem = defineSystem({
  uuid: 'ee.client.WarningUISystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor: () => {
    if (!useMutableState(ReferenceSpaceState).viewerEntity.value) return null
    return <Reactor />
  }
})
