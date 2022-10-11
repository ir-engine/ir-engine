import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { corsProxyPath } from '@xrengine/common/src/config'

import DnsIcon from '@mui/icons-material/Dns'

import { InfoTooltip } from './layout/Tooltip'

type Props = {
  value: string
  onAddCorsProxy: any
}

export const DnsInfoIcon = (styled as any)(DnsIcon)`
  width: 18px;
  display: flex;
  margin-left: 5px;
  color: var(--iconButtonColor);
  cursor: pointer;
  align-self: center;

  &:hover {
    color: var(--iconButtonHoverColor);
  }
`

export const AddCorsProxyButton = (props: Props) => {
  const { t } = useTranslation()

  const onClick = () => {
    props.onAddCorsProxy(`${corsProxyPath}/${props.value}`)
  }

  return props.value?.includes(corsProxyPath) ? null : (
    <InfoTooltip title={t('editor:corsProxyButton:tooltip')!}>
      <DnsInfoIcon onClick={onClick} />
    </InfoTooltip>
  )
}
