import { createState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@xrengine/common/src/logger'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

const logger = multiLogger.child({ component: 'client-core:AnchorWidgetUI' })

export function createAnchorWidgetUI() {
  return createXRUI(AnchorWidgetUI, createProfileDetailState())
}

function createProfileDetailState() {
  return createState({})
}

const AnchorWidgetUI = () => {
  const { t } = useTranslation()

  return <div>{`Align Anchor`}</div>
}

export default AnchorWidgetUI
