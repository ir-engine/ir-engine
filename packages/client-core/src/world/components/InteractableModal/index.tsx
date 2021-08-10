import React, { useEffect, useState, FunctionComponent, Suspense } from 'react'
import { CommonInteractiveData } from '@xrengine/engine/src/interaction/interfaces/CommonInteractiveData'
import styles from './style.module.scss'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from 'react-i18next'
import { OpenLink } from '../OpenLink'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'

const ModelView = React.lazy(() => import('./modelView'))

export const InteractableModal: FunctionComponent = () => {
  const { t } = useTranslation()

  const [hoveredLabel, setHoveredLabel] = useState('')
  const [infoBoxData, setModalData] = useState(null)
  const [openLinkData, setOpenLinkData] = useState(null)

  const [objectActivated, setObjectActivated] = useState(false)
  const [objectHovered, setObjectHovered] = useState(false)
  const [isInputEnabled, setInputEnabled] = useState(true)

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

  const onEngineLoaded = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.OBJECT_ACTIVATION, onObjectActivation)
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.OBJECT_HOVER, onObjectHover)
    document.removeEventListener('ENGINE_LOADED', onEngineLoaded)
  }
  document.addEventListener('ENGINE_LOADED', onEngineLoaded)

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
          <DialogTitle disableTypography className={styles.dialogTitle}>
            <IconButton
              aria-label="close"
              className={styles.dialogCloseButton}
              color="primary"
              onClick={(): void => {
                setModalData(null)
                setInputEnabled(true)
                setObjectActivated(false)
              }}
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
