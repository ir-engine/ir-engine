import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import Box from '@xrengine/ui/src/Box'
import { default as MUIDialog } from '@xrengine/ui/src/Dialog'
import DialogActions from '@xrengine/ui/src/DialogActions'
import DialogContent from '@xrengine/ui/src/DialogContent'
import DialogTitle from '@xrengine/ui/src/DialogTitle'
import Icon from '@xrengine/ui/src/Icon'
import Typography from '@xrengine/ui/src/Typography'

import { Breakpoint, SxProps, Theme } from '@mui/material/styles'

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
        <DialogTitle className={styles.dialogTitle}>
          {showBackButton && <IconButton icon={<Icon type="ArrowBack" />} sx={{ mr: 1 }} onClick={onBack} />}

          {title && (
            <Typography variant="h6" sx={{ ml: showBackButton ? undefined : 1.5 }}>
              {title}
            </Typography>
          )}

          {header}

          {showCloseButton && <IconButton icon={<Icon type="Close" />} sx={{ ml: 1 }} onClick={onClose} />}
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
      <Box className={styles.menu} sx={{ width: '100%', ...sx }}>
        {dialogContent}
      </Box>
    )
  }

  return (
    <MUIDialog open={open} maxWidth={maxWidth} fullWidth PaperProps={{ className: styles.menu }} onClose={onClose}>
      {dialogContent}
    </MUIDialog>
  )
}

export default Menu
