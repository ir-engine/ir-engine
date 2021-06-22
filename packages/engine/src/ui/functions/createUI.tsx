

import React, {Suspense, useEffect, useRef, useState} from 'react'
import {StyleSheetManager} from 'styled-components'

import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { addObject3DComponent } from '../../scene/behaviors/addObject3DComponent'
import { UIRootComponent } from '../components/UIRootComponent'
import { UIComponent } from '../components/UIComponent'

export async function createUI(UI:React.FC) {
    const [Ethereal, ReactDOM] = await Promise.all([
        import('ethereal'),
        import('react-dom')
    ])

    const ui = <UI/>

    const GenerateStyles = (props) => {
        const [styles, setStyles] = useState('')
        useEffect(() => {
            if (!styles) {
                const container = document.createElement('div')
                const target = document.createElement('div')
                ReactDOM.render(
                    <StyleSheetManager target={target}>
                        {ui}
                    </StyleSheetManager>,
                    container,
                    () => {
                        setStyles(target.innerHTML)
                    }
                )
            }
        })
        return props.children({ styles })
    }

    const element = document.createElement('div')
    ReactDOM.render(
        <GenerateStyles>
            {({ styles }) => (
                <>
                    <div dangerouslySetInnerHTML={{ __html: styles }} />
                    {ui}
                </>
            )}
        </GenerateStyles>
    ,element)

    const uiRoot = new Ethereal.WebLayer3D(element, {
        onLayerCreate: (layer) => {
            const layerEntity = createEntity()
            addComponent(layerEntity, UIComponent, {layer})
        }
    })
    const uiEntity = createEntity()
    addObject3DComponent(uiEntity, {obj3d:uiRoot})
    addComponent(uiEntity, UIRootComponent, {layer:uiRoot})

    return uiEntity
}