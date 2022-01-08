import React, { FunctionComponent } from 'react'
import { useTranslation } from 'react-i18next'

import { CommonInteractiveData } from '@xrengine/engine/src/interaction/interfaces/CommonInteractiveData'

import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import styles from './OpenLink.module.scss'

export type OpenLinkProps = {
  onClose: unknown
  data: CommonInteractiveData
}

export const OpenLink: FunctionComponent<OpenLinkProps> = ({ onClose, data }: OpenLinkProps) => {
  const { t } = useTranslation()

  if (!data) {
    return null
  }

  const handleLinkClick = (url) => {
    window.open(url, '_blank')
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
      <DialogTitle className={styles.dialogTitle}>
        <IconButton
          aria-label="close"
          className={styles.dialogCloseButton}
          color="primary"
          onClick={(): void => {
            if (typeof onClose === 'function') {
              onClose()
            }
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h2" align="left">
          {data.interactionText || 'Link'}
        </Typography>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        {/* eslint-disable-next-line react/no-danger */}
        <p className={styles.descr}>{t('editor:openLink.description')}</p>
        {data.payloadUrl && (
          <Button variant="outlined" color="primary" onClick={() => handleLinkClick(data.payloadUrl)}>
            {t('editor:openLink.lbl-open')}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
