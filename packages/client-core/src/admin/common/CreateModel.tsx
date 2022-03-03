import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

import { useStyles } from '../styles/ui'

interface Props {
  handleClose: () => void
  open: boolean
  children: JSX.Element | JSX.Element[]
  text: string
  action: string
  submit: () => void
}

const CreateModel = (props: Props) => {
  const { open, handleClose, children, action, text, submit } = props
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
        fullWidth={true}
        maxWidth="sm"
      >
        <div style={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom={true} className={classes.marginTop}>
            {action} {t('admin:components.common.new')} {text}
          </Typography>
          {children}
          <DialogActions>
            <Button onClick={handleClose} className={classes.spanNone}>
              {t('admin:components.common.cancel')}
            </Button>
            <Button className={classes.spanDange} autoFocus onClick={submit}>
              {action}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default CreateModel
