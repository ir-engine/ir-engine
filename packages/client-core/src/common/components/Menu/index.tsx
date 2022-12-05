import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'

import ArrowBack from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import { default as MUIDialog } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Popover from '@mui/material/Popover'
import { Breakpoint } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import styles from './index.module.scss'

interface Props {
  open: boolean
  actions?: React.ReactNode
  children?: React.ReactNode
  header?: React.ReactNode
  isPopover?: boolean
  maxWidth?: Breakpoint | false
  popoverAnchor?: Element
  showBackButton?: boolean
  showCloseButton?: boolean
  showDefaultActions?: boolean
  title?: string
  onBack?: () => void
  onClose?: () => void
  onSubmit?: () => void
}

const Menu = ({
  open,
  actions,
  children,
  header,
  isPopover,
  maxWidth,
  popoverAnchor,
  showBackButton,
  showCloseButton,
  showDefaultActions,
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
      <DialogTitle className={styles.dialogTitle}>
        {showBackButton && <IconButton icon={<ArrowBack />} sx={{ mr: 1 }} onClick={onBack} />}

        {title && <Typography variant="h6">{title}</Typography>}

        {header}

        {showCloseButton && <IconButton icon={<CloseIcon />} sx={{ ml: 1 }} onClick={onClose} />}
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      <DialogActions>
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
    </>
  )

  if (isPopover) {
    return (
      <Popover
        open={open}
        anchorEl={popoverAnchor}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {dialogContent}
      </Popover>
    )
  }

  return (
    <MUIDialog open={open} maxWidth={maxWidth} fullWidth PaperProps={{ className: styles.dialog }} onClose={onClose}>
      {dialogContent}
    </MUIDialog>
  )
}

export default Menu
