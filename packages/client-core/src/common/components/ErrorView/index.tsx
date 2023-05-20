import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Variant } from '@mui/material/styles/createTypography'

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
      <Icon type="CancelOutlined" sx={{ fontSize: 40, marginBottom: 1, color: 'red' }} />
      <Typography variant={variant} sx={{ marginBottom: 1 }}>
        {error}
      </Typography>
      {detail && (
        <Typography variant={bodyVariant} sx={{ marginBottom: 1 }}>
          {detail}
        </Typography>
      )}
      {onRetry && (
        <Button type="outlined" startIcon={<Icon type="CachedOutlined" />} sx={{ marginTop: 1 }} onClick={onRetry}>
          {retryText ? retryText : t('common:components.retry')}
        </Button>
      )}
    </Box>
  )

  return content
}

export default ErrorView
