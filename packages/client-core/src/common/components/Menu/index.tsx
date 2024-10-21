/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Breakpoint, SxProps, Theme } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@ir-engine/client-core/src/common/components/Button'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import { default as MUIDialog } from '@ir-engine/ui/src/primitives/mui/Dialog'
import DialogActions from '@ir-engine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@ir-engine/ui/src/primitives/mui/DialogContent'
import DialogTitle from '@ir-engine/ui/src/primitives/mui/DialogTitle'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButton from '@ir-engine/ui/src/primitives/mui/IconButton'
import Typography from '@ir-engine/ui/src/primitives/mui/Typography'

import styles from './index.module.scss'

interface Props {
  open: boolean
  actions?: React.ReactNode
  children?: React.ReactNode
  contentMargin?: string | number
  header?: React.ReactNode
  isPopover?: boolean
  maxWidth?: Breakpoint | false
  showBackButton?: boolean
  showCloseButton?: boolean
  showDefaultActions?: boolean
  sx?: SxProps<Theme>
  title?: string
  onBack?: () => void
  onClose?: () => void
  onSubmit?: () => void
}

const Menu = ({
  open,
  actions,
  children,
  contentMargin,
  header,
  isPopover,
  maxWidth,
  showBackButton,
  showCloseButton,
  showDefaultActions,
  sx,
  title,
  onBack,
  onClose,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useTranslation()

  if (!maxWidth) {
    maxWidth = 'sm'
  }

  const dialogContent = (
    <>
      {(showBackButton || title || header || showCloseButton) && (
        <DialogTitle className="flex items-center px-3 py-4">
          <span>
            {showBackButton && <IconButton icon={<Icon type="ArrowBack" />} sx={{ mr: 1 }} onClick={onBack} />}

            {title && (
              <Typography variant="h6" sx={{ ml: showBackButton ? undefined : 1.5 }}>
                {title}
              </Typography>
            )}

            {header}

            {showCloseButton && (
              <IconButton
                icon={<Icon type="Close" />}
                sx={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}
                onClick={onClose}
              />
            )}
          </span>
        </DialogTitle>
      )}

      <DialogContent sx={{ margin: contentMargin }}>{children}</DialogContent>

      {(showDefaultActions || actions) && (
        <DialogActions className={styles.dialogActions}>
          {showDefaultActions && (
            <>
              <Button type="outlined" onClick={onClose}>
                {t('common:components.cancel')}
              </Button>
              <Button type="gradient" autoFocus onClick={onSubmit}>
                {t('common:components.confirm')}
              </Button>
            </>
          )}
          {actions}
        </DialogActions>
      )}
    </>
  )

  if (isPopover) {
    return (
      <Box className={styles.menu} sx={{ pointerEvents: 'all', width: '100%', ...sx }}>
        {dialogContent}
      </Box>
    )
  }

  return (
    <MUIDialog
      disablePortal
      sx={{ pointerEvents: 'all', ...sx }}
      open={open}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{ className: styles.menu }}
      onClose={onClose}
    >
      {dialogContent}
    </MUIDialog>
  )
}

export default Menu
