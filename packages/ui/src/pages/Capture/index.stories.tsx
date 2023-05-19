// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AuthSettingsServiceReceptor } from '@etherealengine/client-core/src/admin/services/Setting/AuthSettingService'
// import { useLocation, useNavigate } from 'react-router-dom'

import {
  AuthSettingsService,
  AuthSettingsState
} from '@etherealengine/client-core/src/admin/services/Setting/AuthSettingService'
import {
  AdminClientSettingsState,
  ClientSettingService
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import { ClientSettingsServiceReceptor } from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import {
  AdminCoilSettingService,
  AdminCoilSettingsState
} from '@etherealengine/client-core/src/admin/services/Setting/CoilSettingService'
import { API } from '@etherealengine/client-core/src/API'
import {
  NotificationAction,
  NotificationActions
} from '@etherealengine/client-core/src/common/services/NotificationService'
import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { ProjectServiceReceptor } from '@etherealengine/client-core/src/common/services/ProjectService'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { ClientNetworkingSystem } from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { RecordingServiceSystem } from '@etherealengine/client-core/src/recording/RecordingService'
import { LocationServiceReceptor } from '@etherealengine/client-core/src/social/services/LocationService'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { AuthService, AuthServiceReceptor } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import Engine_tw from '@etherealengine/client/src/engine_tw'
import { CustomRoute, getCustomRoutes } from '@etherealengine/client/src/route/getCustomRoutes'
import { MediaSystem } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { InputSystemGroup, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystem, startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import {
  addActionReceptor,
  dispatchAction,
  getMutableState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import Component from './index'

const startCaptureSystems = () => {
  startSystem(MotionCaptureSystem, { with: InputSystemGroup })
  startSystem(MediaSystem, { before: PresentationSystemGroup })
  startSystems([ClientNetworkingSystem, RecordingServiceSystem], { after: PresentationSystemGroup })
}

const initializeEngineForRecorder = async () => {
  // if (getMutableState(EngineState).isEngineInitialized.value) return

  // const projects = API.instance.client.service('projects').find()

  startCaptureSystems()
  // await loadEngineInjection(await projects)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
  dispatchAction(EngineActions.sceneLoaded({}))
}

const argTypes = {}

export default {
  title: 'Pages/Capture',
  component: Component,
  decorators: [
    (Story) => {
      const notistackRef = useRef<SnackbarProvider>()
      const authState = useHookstate(getMutableState(AuthState))
      const selfUser = authState.user

      const [projectComponents, setProjectComponents] = useState<Array<any>>([])
      const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
      const projectState = useHookstate(getMutableState(ProjectState))

      const { t } = useTranslation()

      useEffect(() => {
        const receptor = (action): any => {
          // @ts-ignore
          matches(action).when(NotificationAction.notify.matches, (action) => {
            AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.alert, 0.5)
            notistackRef.current?.enqueueSnackbar(action.message, {
              variant: action.options.variant,
              action: NotificationActions[action.options.actionType ?? 'default']
            })
          })
        }
        addActionReceptor(receptor)

        return () => {
          removeActionReceptor(receptor)
        }
      }, [])

      useEffect(() => {
        if (selfUser?.id.value && projectState.updateNeeded.value) {
          ProjectService.fetchProjects()
          if (!fetchedProjectComponents) {
            setFetchedProjectComponents(true)
            Engine.instance.api
              .service('projects')
              .find()
              .then((projects) => {
                loadEngineInjection(projects).then((result) => {
                  dispatchAction(LocationAction.setLocationName({ locationName }))
                  initializeEngineForRecorder()
                  setProjectComponents(result)
                })
              })
          }
        }
      }, [selfUser, projectState.updateNeeded.value])

      useEffect(() => {
        Engine.instance.userId = selfUser.id.value
      }, [selfUser.id])

      useEffect(() => {
        authState.isLoggedIn.value && AdminCoilSettingService.fetchCoil()
      }, [authState.isLoggedIn])

      useEffect(() => {
        addActionReceptor(ClientSettingsServiceReceptor)
        addActionReceptor(AuthSettingsServiceReceptor)
        addActionReceptor(AuthServiceReceptor)
        addActionReceptor(LocationServiceReceptor)
        addActionReceptor(ProjectServiceReceptor)

        // Oauth callbacks may be running when a guest identity-provider has been deleted.
        // This would normally cause doLoginAuto to make a guest user, which we do not want.
        // Instead, just skip it on oauth callbacks, and the callback handler will log them in.
        // The client and auth settigns will not be needed on these routes
        if (!/auth\/oauth/.test(location.pathname)) {
          AuthService.doLoginAuto()
          AuthSettingsService.fetchAuthSetting()
        }

        getMutableState(NetworkState).config.set({
          world: true,
          media: true,
          friends: false,
          instanceID: true,
          roomID: false
        })

        return () => {
          // removeActionReceptor(RouterServiceReceptor)
          removeActionReceptor(ClientSettingsServiceReceptor)
          removeActionReceptor(AuthSettingsServiceReceptor)
          removeActionReceptor(AuthServiceReceptor)
          removeActionReceptor(LocationServiceReceptor)
          removeActionReceptor(ProjectServiceReceptor)
        }
      }, [])

      AuthService.useAPIListeners()
      SceneService.useAPIListeners()

      useLoadLocationScene()

      const locationName = 'default'

      const engineState = useHookstate(getMutableState(EngineState))

      if (!engineState.isEngineInitialized.value && !engineState.connectedWorld.value) return <></>

      return (
        <div style={{ height: '100vh', pointerEvents: 'auto' }}>
          <Story />
          {projectComponents}
        </div>
      )
    }
  ],
  parameters: {
    reactRouter: {
      routePath: '/capture/:locationName',
      routeParams: { locationName: 'default' }
    },
    componentSubtitle: 'Capture',
    jest: 'Capture.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
