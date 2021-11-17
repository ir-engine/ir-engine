import { Extension } from '@styled-icons/boxicons-solid/Extension'
import React from 'react'
import { useTranslation } from 'react-i18next'
import NodeEditor from './NodeEditor'

export function SystemNodeEditor(props: { node?: any; t: any }) {
  const { t } = useTranslation()

  return <NodeEditor {...props} description={t('editor:properties.game.description')} />
}

SystemNodeEditor.iconComponent = Extension

export default SystemNodeEditor
