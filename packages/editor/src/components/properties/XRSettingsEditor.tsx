import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import PropertyGroup from './PropertyGroup'

export const XRSettingsEditor = () => {
  const { t } = useTranslation()
  const sceneMetadata = useHookstate(Engine.instance.currentWorld.sceneMetadata.xr)
  return <PropertyGroup name={t('editor:properties.xr.name')}></PropertyGroup>
}
