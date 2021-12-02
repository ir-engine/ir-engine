import React, { useEffect, useState, FunctionComponent, Suspense } from 'react'
import { CommonInteractiveData } from '@xrengine/engine/src/interaction/interfaces/CommonInteractiveData'
import styles from './style.module.scss'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { OpenLink } from '../OpenLink'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'
import { useEngineState } from '../../services/EngineService'
import { UserAction, useUserState } from '../../../user/services/UserService'
import { useDispatch } from '../../../store'

const ModelView = React.lazy(() => import('./modelView'))

export const InteractableModal: FunctionComponent = () => {
  const { t } = useTranslation()

  const [hoveredLabel, setHoveredLabel] = useState('')
  const [infoBoxData, setModalData] = useState(null)
  const [openLinkData, setOpenLinkData] = useState(null)

  const [objectActivated, setObjectActivated] = useState(false)
  const [objectHovered, setObjectHovered] = useState(false)
  const [isInputEnabled, setInputEnabled] = useState(true)

  const engineState = useEngineState()

  const dispatch = useDispatch()

  const userState = useUserState()

  useEffect(() => {
    enableInput({
      keyboard: isInputEnabled,
      mouse: isInputEnabled
    })
  }, [isInputEnabled])

  const onObjectHover = ({ focused, interactionText }: { focused: boolean; interactionText: string }): void => {
    setObjectHovered(focused)
    let displayText = interactionText
    const length = interactionText && interactionText.length
    if (length > 110) {
      displayText = interactionText.substring(0, 110) + '...'
    }
    setHoveredLabel(displayText)
  }

  const onObjectActivation = (interactionData): void => {
    setModalData(interactionData)
    setInputEnabled(false)
    setObjectActivated(true)
  }
  const onUserAvatarTapped = (event): void => {
    if (event.userId != userState.selectedLayerUser.value) {
      dispatch(UserAction.selectedLayerUser(event.userId || ''))
    }
  }

  useEffect(() => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.OBJECT_ACTIVATION, onObjectActivation)
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.OBJECT_HOVER, onObjectHover)
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.USER_AVATAR_TAPPED, onUserAvatarTapped)
  }, [engineState.isInitialised.value])

  const handleLinkClick = (url) => {
    window.open(url, '_blank')
  }

  return (
    infoBoxData && (
      <>
        <Dialog
          open={true}
          aria-labelledby="xr-dialog"
          classes={{
            root: styles.customDialog,
            paper: styles.customDialogInner
          }}
          BackdropProps={{ style: { backgroundColor: 'transparent' } }}
        >
          <DialogTitle className={styles.dialogTitle}>
            <IconButton
              aria-label="close"
              className={styles.dialogCloseButton}
              color="primary"
              onClick={(): void => {
                setModalData(null)
                setInputEnabled(true)
                setObjectActivated(false)
              }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h2" align="left">
              {infoBoxData.payloadName}
            </Typography>
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {infoBoxData.payloadModelUrl && (
              <Suspense fallback={<></>}>
                <ModelView modelUrl={infoBoxData.payloadModelUrl} />
              </Suspense>
            )}
            {infoBoxData.payloadHtmlContent && (
              <div className={styles.dialogContentContainer}>
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: infoBoxData.payloadHtmlContent }} />
              </div>
            )}
            {infoBoxData.payloadUrl && <p>{infoBoxData.payloadUrl}</p>}
            {infoBoxData.interactionText && <p className={styles.dialogContentText}>{infoBoxData.interactionText}</p>}
            {infoBoxData.payloadBuyUrl && (
              <Button variant="outlined" color="primary" onClick={() => handleLinkClick(infoBoxData.payloadBuyUrl)}>
                {t('editor:interactableModel.lbl-buy')}
              </Button>
            )}
            {infoBoxData.payloadLearnMoreUrl && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleLinkClick(infoBoxData.payloadLearnMoreUrl)}
              >
                {t('editor:interactableModel.lbl-learnMore')}
              </Button>
            )}
            {/* { data.url? <iframe className="iframe" src={data.url} /> : null } */}
          </DialogContent>
        </Dialog>
        <OpenLink
          onClose={() => {
            setOpenLinkData(null)
            setObjectActivated(false)
            setInputEnabled(true)
          }}
          data={openLinkData}
        />
      </>
    )
  )
}
