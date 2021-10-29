import React, { useCallback, useState } from 'react'
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
const SceneMetaDataEditor = (props: { node: any; t: Function }) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onChangeMetaData = (meta_data) => {
    const metaDataComponent = getComponent(props.node.eid, MetaDataComponent)
    metaDataComponent.meta_data = meta_data
    forceUpdate()
  }

  const metaDataComponent = getComponent(props.node.eid, MetaDataComponent)

  return (
    <NodeEditor {...props}>
      <InputGroup name="Metadata" label="Metadata">
        <StringInput value={metaDataComponent.meta_data} onChange={onChangeMetaData} />
      </InputGroup>
    </NodeEditor>
  )
}

export default withTranslation()(SceneMetaDataEditor)
