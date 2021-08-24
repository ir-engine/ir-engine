import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import { Cubes } from '@styled-icons/fa-solid/Cubes'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
type GroupNodeEditorProps = {
  editor?: object
  node?: object
  t: Function
}

/**
 * GroupNodeEditor used to render group of multiple objects.
 *
 * @author Robert Long
 * @type {class component}
 */
export class GroupNodeEditor extends Component<GroupNodeEditorProps, {}> {
  //setting icon for GroupNod
  static iconComponent = Cubes

  //description for groupNode and will appears on properties container
  static description = i18n.t('editor:properties.group.description')
  render() {
    GroupNodeEditor.description = this.props.t('editor:properties.group.description')
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={GroupNodeEditor.description} />
    )
  }
}

export default withTranslation()(GroupNodeEditor)
