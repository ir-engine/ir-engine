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
  handleClose: any
  createProject: (name: string) => Promise<void>
}

export const CreateProjectDialog = (props: Props): any => {
  const { t } = useTranslation()
  const { open, handleClose, createProject } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [projectName, setProjectName] = useState('')

  const onCreateProject = async () => {
    if (!projectName) return

    setProcessing(true)
    try {
      await createProject(projectName)
      closeDialog()
    } catch (err) {
      setError(err.message)
    }

    setProcessing(false)
  }

  const handleSubmitOnEnter = (event) => {
    if (event.key === 'Enter') {
      onCreateProject()
    }
  }

  const closeDialog = () => {
    setProjectName('')
    handleClose()
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
      <DialogTitle>{t('editor.projects.createProject')}</DialogTitle>
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
              placeholder={t('editor.projects.projectName')}
              InputProps={{
                classes: {
                  root: styles.inputContainer,
                  notchedOutline: styles.outline,
                  input: styles.input
                }
              }}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={handleSubmitOnEnter}
            />
            {error && error.length > 0 && <h2 className={styles.errorMessage}>{error}</h2>}
            <Button onClick={onCreateProject} className={styles.btn} disabled={!projectName}>
              {t('editor.projects.lbl-createProject')}
            </Button>
          </FormControl>
        )}
      </DialogContent>
    </Dialog>
  )
}
