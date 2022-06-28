import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { API } from '@xrengine/client-core/src/API'
import { EditorAction, useEditorState } from '@xrengine/editor/src/services/EditorServices'
import { ModelComponentType } from '@xrengine/engine/src/scene/components/ModelComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { Button } from '../inputs/Button'

const TransformContainer = (styled as any).div`
margin: 16px;`

export default function ModelTransformProperties({ modelComponent, onChangeModel }) {
  const editorState = useEditorState()
  const [transforming, setTransforming] = useState<boolean>(false)
  async function onTransformModel() {
    setTransforming(true)
    const nuPath = await API.instance.client.service('model-transform').create({ path: modelComponent.src })

    dispatchAction(
      EditorAction.projectChanged({
        projectName: editorState.projectName.value!
      })
    )
    await new Promise((resolve) => setTimeout(resolve, 100))

    onChangeModel(nuPath)
    setTransforming(false)
  }
  return (
    <TransformContainer>
      {!transforming && <Button onClick={onTransformModel}>Transform</Button>}
      {transforming && <p>Transforming...</p>}
    </TransformContainer>
  )
}
