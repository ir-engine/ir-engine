import React, { Component } from 'react'
import { Link } from '@styled-icons/fa-solid/Link'
import NodeEditor from './NodeEditor'
import Editor from '../Editor'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import { withTranslation } from 'react-i18next'


export function MetadataNodeEditor(props: { editor?: any; node?: any; t: any }) {
    const { node, editor, t } = props

    const onChangeData = (value) => {
        editor.setPropertySelected('_data', value)
    }

    const description = 'Custom Metadata Node'

    return (
        <NodeEditor {...props} description={description}>
            {/* @ts-ignore */}
            <InputGroup name = 'Data' label = 'Data'>
                {/* @ts-ignore */}
                 <StringInput value={node._data} onChange={onChangeData} />
            </InputGroup>
        </NodeEditor> 
    )
}

MetadataNodeEditor.iconComponent = Link 
export default withTranslation()(MetadataNodeEditor)