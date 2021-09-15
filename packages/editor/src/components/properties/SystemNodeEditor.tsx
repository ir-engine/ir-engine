import { Extension } from '@styled-icons/boxicons-solid/Extension'
import i18n from 'i18next'
import React from 'react'
import { withTranslation } from 'react-i18next'
import NodeEditor from './NodeEditor'

export function SystemNodeEditor(props: { node?: any; t: any }) {
  const description = i18n.t('editor:properties.game.description')

  return <NodeEditor {...props} description={description} />
}

SystemNodeEditor.iconComponent = Extension

export default withTranslation()(SystemNodeEditor)
