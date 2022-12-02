import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import Box from '@mui/material/Box'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

type RetryCallback = () => void

interface Props {
  error: string
  detail?: string
  retryText?: string
  variant?: Variant
  bodyVariant?: Variant
  onRetry?: RetryCallback
}

const ErrorView = ({ error, detail, retryText, variant, bodyVariant, onRetry }: Props) => {
  const { t } = useTranslation()

  if (!variant) {
    variant = 'h6'
  }
  if (!bodyVariant) {
    bodyVariant = 'body2'
  }

  const content = (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CancelOutlinedIcon sx={{ fontSize: 40, marginBottom: 1, color: 'red' }} />
      <Typography variant={variant} sx={{ marginBottom: 1 }}>
        {error}
      </Typography>
      {detail && (
        <Typography variant={bodyVariant} sx={{ marginBottom: 1 }}>
          {detail}
        </Typography>
      )}
      {onRetry && (
        <Button type="outlined" startIcon={<CachedOutlinedIcon />} sx={{ marginTop: 1 }} onClick={onRetry}>
          {retryText ? retryText : t('common:components.retry')}
        </Button>
      )}
    </Box>
  )

  return content
}

export default ErrorView
