import { SnackbarKey, useSnackbar } from 'notistack'
import { Fragment } from 'react'
import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  const { closeSnackbar } = useSnackbar()

  return (
    <Fragment>
      {content}
      <IconButton onClick={() => closeSnackbar(key)} icon={<Icon type="Close" sx={{ color: 'white' }} />} />
    </Fragment>
  )
}
