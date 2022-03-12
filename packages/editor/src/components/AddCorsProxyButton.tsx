import React from 'react'
import { useTranslation } from 'react-i18next'

import { corsProxyPath } from '@xrengine/client-core/src/util/getCorsProxyPath'

import DnsIcon from '@mui/icons-material/Dns'
import Tooltip from '@mui/material/Tooltip'

type Props = {
  value: string
  onAddCorsProxy: any
}

export const AddCorsProxyButton = (props: Props) => {
  const { t } = useTranslation()

  const onClick = () => {
    props.onAddCorsProxy(`${corsProxyPath}/${props.value}`)
  }

  return props.value?.includes(corsProxyPath) ? null : (
    <Tooltip title={t('editor:corsProxyButton:tooltip') as string} placement="left" disableInteractive>
      <DnsIcon style={{ color: 'white' }} onClick={onClick} />
    </Tooltip>
  )
}
