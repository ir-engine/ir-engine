import React, { useState, useEffect } from 'react'
import { useWebxrNativeState } from '@xrengine/social/src/reducers/webxr_native/WebxrNativeState'
import WebXRPlugin from '../../WebXRPlugin'
import { useHistory, useParams } from 'react-router-dom'
import { XRPlugin } from 'webxr-native'
import { useArMediaState } from '@xrengine/social/src/reducers/arMedia/ArMediaState'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'

import { useDispatch } from 'react-redux'
import { PopupsStateService } from '@xrengine/social/src/reducers/popupsState/PopupsStateService'

import styles from '../../../pages/index.module.scss'
import './index.module.scss'

export const WebXRStart = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)

  const webxrnativeState = useWebxrNativeState()
  const webxrRecorderActivity = webxrnativeState.webxrnative.value

  const arMediaState = useArMediaState()
  const { videoId } = useParams()

  const getFiles = async (selectedItem) => {
    await XRPlugin.uploadFiles({
      audioPath: selectedItem.audioUrl,
      audioId: selectedItem.audioId
    })
  }

  useEffect(() => {
    getFiles(arMediaState.list.value.find((item) => item.id === videoId))
    dispatch(PopupsStateService.updateWebXRState(true, videoId))
  }, [])

  const changeWebXrNative = () => {
    history.push('/')
  }
  const platformClass = isIOS ? styles.isIos : ''

  return (
    <div className={platformClass + ' ' + styles.hideContentOnRecord}>
      <div className={styles.hideContent + ' ' + styles.viewport}>
        <WebXRPlugin
          itemId={videoId}
          feedHintsOnborded={feedHintsOnborded}
          setFeedHintsOnborded={setFeedHintsOnborded}
          setContentHidden={changeWebXrNative}
          webxrRecorderActivity={true}
        />
      </div>
    </div>
  )
}

export default WebXRStart
