import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  url: string
  onClose: any
  onSuccess: (url: string) => Promise<void>
}

export const EditGithubRepoDialog = (props: Props): any => {
  const { t } = useTranslation()
  const { open, onClose, onSuccess, url } = props

  const [error, setError] = useState('')
  const [projectUrl, setProjectUrl] = useState('')

  useEffect(() => {
    if (open) {
      setProjectUrl(url)
    }
  }, [open])

  const onChangeLinkProject = async () => {
    if (!projectUrl) return

    try {
      await onSuccess(projectUrl)
      closeDialog()
    } catch (err) {
      setError(err.message)
    }
  }

  const onUnlinkProject = async () => {
    try {
      await onSuccess('')
      closeDialog()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmitOnEnter = (event) => {
    if (event.key === 'Enter') {
      onUnlinkProject()
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
      TransitionProps={{ in: props.open }}
    >
      <DialogTitle>{t('editor.projects.onSuccess')}</DialogTitle>
      <DialogContent>
        <FormControl>
          <TextField
            id="outlined-basic"
            variant="outlined"
            size="small"
            placeholder={t('editor.projects.githubURL')}
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
          <div className={styles.deleteButtons}>
            <Button onClick={onChangeLinkProject} className={styles.btn}>
              {t('editor.projects.changeLinkButton')}
            </Button>
            <Button onClick={onUnlinkProject} className={styles.btn}>
              {t('editor.projects.unLinkButton')}
            </Button>
          </div>
        </FormControl>
      </DialogContent>
    </Dialog>
  )
}
