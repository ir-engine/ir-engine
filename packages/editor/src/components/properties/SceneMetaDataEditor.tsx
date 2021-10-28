import React from 'react'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { withTranslation } from 'react-i18next'
import StringInput from '../inputs/StringInput'
import { MetaDataComponent } from '@xrengine/engine/src/scene/components/MetaDataComponent'

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @author Robert Long
 * @param       props
 * @constructor
 */
export class SceneMetaDataEditor extends React.Component<{node: any, t: Function}> {
  onChangeMetaData = (meta_data) => {
    const metaDataComponent = getComponent(this.props.node.eid, MetaDataComponent)
    metaDataComponent.meta_data = meta_data
    this.forceUpdate()
  }

  render() {
    const metaDataComponent = getComponent(this.props.node.eid, MetaDataComponent)

    return (
      <NodeEditor {...this.props}>
        <InputGroup name="Metadata" label="Metadata">
          <StringInput value={metaDataComponent.meta_data} onChange={this.onChangeMetaData} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(SceneMetaDataEditor)
