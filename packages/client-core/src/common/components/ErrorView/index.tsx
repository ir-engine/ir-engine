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

import { Variant } from '@mui/material/styles/createTypography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@ir-engine/client-core/src/common/components/Button'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import Typography from '@ir-engine/ui/src/primitives/mui/Typography'

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
