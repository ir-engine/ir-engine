import { SnackbarKey, useSnackbar } from 'notistack'
import { Fragment } from 'react'
import React from 'react'

import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  const { closeSnackbar } = useSnackbar()

  return (
    <Fragment>
      {content}
      <IconButton onClick={() => closeSnackbar(key)}>
        <Icon type="Close" sx={{ color: 'white' }} />
      </IconButton>
    </Fragment>
  )
}
