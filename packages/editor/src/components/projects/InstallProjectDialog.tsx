import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  onSuccess: (url: string) => Promise<void>
  onClose: () => void
}

export const InstallProjectDialog = ({ open, onSuccess, onClose }: Props): any => {
  const { t } = useTranslation()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [projectUrl, setProjectUrl] = useState('')

  const onInstallProject = async () => {
    if (!projectUrl) return

    setProcessing(true)
    try {
      await onSuccess(projectUrl)
      closeDialog()
    } catch (err) {
      setError(err.message)
    }

    setProcessing(false)
  }

  const handleSubmitOnEnter = (event) => {
    if (event.key === 'Enter') {
      onInstallProject()
    }
  }

  const closeDialog = () => {
    setProjectUrl('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      classes={{ paper: styles.createProjectDialog }}
      onClose={closeDialog}
      closeAfterTransition
      TransitionComponent={Fade}
      TransitionProps={{ in: open }}
    >
      <DialogTitle>{t('editor.projects.installProject')}</DialogTitle>
      <DialogContent>
        {processing ? (
          <div className={styles.processing}>
            <CircularProgress size={30} />
            <div className={styles.text}>{t('editor.projects.processing')}</div>
          </div>
        ) : (
          <FormControl>
            <TextField
              id="outlined-basic"
              variant="outlined"
              size="small"
              placeholder={t('editor.projects.projectURL')}
              InputProps={{
                classes: {
                  root: styles.inputContainer,
                  notchedOutline: styles.outline,
                  input: styles.input
                }
              }}
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              onKeyDown={handleSubmitOnEnter}
            />
            {error && error.length > 0 && <h2 className={styles.errorMessage}>{error}</h2>}
            <Button onClick={onInstallProject} className={styles.btn} disabled={!projectUrl}>
              {t('editor.projects.install')}
            </Button>
          </FormControl>
        )}
      </DialogContent>
    </Dialog>
  )
}
