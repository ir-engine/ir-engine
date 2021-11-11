import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import { Cubes } from '@styled-icons/fa-solid/Cubes'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
type GroupNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * GroupNodeEditor used to render group of multiple objects.
 *
 * @author Robert Long
 * @type {class component}
 */
export const GroupNodeEditor = (props: GroupNodeEditorProps) => {
  return <NodeEditor {...props} description={GroupNodeEditor.description} />
}

GroupNodeEditor.iconComponent = Cubes
GroupNodeEditor.description = i18n.t('editor:properties.group.description')

export default withTranslation()(GroupNodeEditor)
