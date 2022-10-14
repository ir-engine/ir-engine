import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  LocationInstanceConnectionAction,
  LocationInstanceConnectionServiceReceptor,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { leaveNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientNetwork'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'

import DirectionsRun from '@mui/icons-material/DirectionsRun'
import DoneIcon from '@mui/icons-material/Done'

import { useEditorState } from '../../services/EditorServices'
import SelectInput from '../inputs/SelectInput'
import { InfoTooltip } from '../layout/Tooltip'
import * as styles from '../toolbar/styles.module.scss'
import {
  EditorActiveInstanceService,
  EditorActiveInstanceServiceReceptor,
  useEditorActiveInstanceState
} from './EditorActiveInstanceService'
import { useEditorNetworkInstanceProvisioning } from './useEditorNetworkInstanceProvisioning'

export const WorldInstanceConnection = () => {
  const { t } = useTranslation()
  const activeInstanceState = useEditorActiveInstanceState()
  const activeInstances = [
    {
      label: 'None',
      value: 'None'
    }
  ].concat(
    activeInstanceState.activeInstances.value.map((instance) => {
      return {
        label: instance.id,
        value: instance.id
      }
    })
  )

  const editorState = useEditorState()
  const sceneId = `${editorState.projectName.value}/${editorState.sceneName.value}`

  EditorActiveInstanceService.useAPIListeners()

  useEffect(() => {
    addActionReceptor(EditorActiveInstanceServiceReceptor)
    addActionReceptor(LocationInstanceConnectionServiceReceptor)
    return () => {
      removeActionReceptor(EditorActiveInstanceServiceReceptor)
      removeActionReceptor(LocationInstanceConnectionServiceReceptor)
    }
  }, [])

  useEditorNetworkInstanceProvisioning()

  const onSelectInstance = (selectedInstance: string) => {
    if (selectedInstance === 'None' || (worldNetworkHostId && selectedInstance !== worldNetworkHostId)) {
      if (worldNetworkHostId) {
        leaveNetwork(Engine.instance.currentWorld.worldNetwork as SocketWebRTCClientNetwork)
      }
      return
    }
    const instance = activeInstanceState.activeInstances.value.find(({ id }) => id === selectedInstance)
    if (!instance) return
    EditorActiveInstanceService.provisionServer(instance.location, instance.id, sceneId)
  }
  // const decrementPage = () => { }
  // const incrementPage = () => { }

  const worldNetworkHostId = Engine.instance.currentWorld.worldNetwork?.hostId
  const instanceConnectionState = useLocationInstanceConnectionState()
  const currentLocationInstanceConnection = instanceConnectionState.instances[worldNetworkHostId!].ornull

  const getIcon = () => {
    if (currentLocationInstanceConnection?.value) {
      if (currentLocationInstanceConnection.connected) return <DoneIcon fontSize="small" />
      if (currentLocationInstanceConnection.connecting)
        return <LoadingCircle message={t('common:loader.connectingToWorld')} />
    }
    return <DirectionsRun fontSize="small" />
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip title="Active Instances">{getIcon()}</InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onSelectInstance}
        options={activeInstances}
        value={'None'}
        creatable={false}
        isSearchable={false}
      />
      {/* <button onClick={decrementPage} className={styles.toolButton} >Previous Page</button>
      <button onClick={incrementPage} className={styles.toolButton} >Next Page</button> */}
    </div>
  )
}
