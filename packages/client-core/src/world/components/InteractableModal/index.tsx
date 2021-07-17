import React, { FunctionComponent, Suspense } from 'react'
import { CommonInteractiveData } from '@xrengine/engine/src/interaction/interfaces/CommonInteractiveData'
// @ts-ignore
import styles from './style.module.scss'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from 'react-i18next'

const ModelView = React.lazy(() => import('./modelView'))

export type InteractableModalProps = {
  onClose: unknown
  data: CommonInteractiveData
}

export const InteractableModal: FunctionComponent<InteractableModalProps> = ({
  onClose,
  data
}: InteractableModalProps) => {
  const { t } = useTranslation()

  if (!data) {
    return null
  }

  const handleLinkClick = (url) => {
    window.open(url, '_blank')
  }

  let modelView = null
  if (data.payloadModelUrl) {
    modelView = (
      <Suspense fallback={<></>}>
        <ModelView modelUrl={data.payloadModelUrl} />
      </Suspense>
    )
  }
  return (
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
            if (typeof onClose === 'function') {
              onClose()
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h2" align="left">
          {data.payloadName}
        </Typography>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        {modelView}
        {data.payloadHtmlContent && (
          <div className={styles.dialogContentContainer}>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: data.payloadHtmlContent }} />
          </div>
        )}
        {data.payloadUrl && <p>{data.payloadUrl}</p>}
        {data.interactionText && <p className={styles.dialogContentText}>{data.interactionText}</p>}
        {data.payloadBuyUrl && (
          <Button variant="outlined" color="primary" onClick={() => handleLinkClick(data.payloadBuyUrl)}>
            {t('editor:interactableModel.lbl-buy')}
          </Button>
        )}
        {data.payloadLearnMoreUrl && (
          <Button variant="outlined" color="secondary" onClick={() => handleLinkClick(data.payloadLearnMoreUrl)}>
            {t('editor:interactableModel.lbl-learnMore')}
          </Button>
        )}
        {/* { data.url? <iframe className="iframe" src={data.url} /> : null } */}
      </DialogContent>
    </Dialog>
  )
}
