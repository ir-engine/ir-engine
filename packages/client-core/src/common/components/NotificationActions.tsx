import { SnackbarKey, useSnackbar } from 'notistack'
import { Fragment } from 'react'
import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  const { closeSnackbar } = useSnackbar()

  return (
    <Fragment>
      {content}
      <IconButton onClick={() => closeSnackbar(key)}>
        <CloseIcon sx={{ color: 'white' }} />
      </IconButton>
    </Fragment>
  )
}
