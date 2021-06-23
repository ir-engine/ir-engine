

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
                const target = document.createElement('div')
                ReactDOM.render(
                    <StyleSheetManager target={target}>
                        {ui}
                    </StyleSheetManager>,
                    document.createElement('div'),
                    () => {
                        setStyles(target.innerHTML)
                    }
                )
            }
        })
        return props.children({ styles })
    }

    const containerElement = document.createElement('div')
    containerElement.style.position = 'fixed'

    ReactDOM.render(
        <GenerateStyles>
            {({ styles }) => (
                <>
                    <div dangerouslySetInnerHTML={{ __html: styles }} />
                    {ui}
                </>
            )}
        </GenerateStyles>
    ,containerElement)

    const uiRoot = new Ethereal.WebLayer3D(containerElement, {
        onLayerCreate: (layer) => {
            layer.element['layer'] = layer
            const layerEntity = createEntity()
            addComponent(layerEntity, UIComponent, {layer})
        }
    })
    const uiEntity = createEntity()
    addObject3DComponent(uiEntity, {obj3d:uiRoot})
    addComponent(uiEntity, UIRootComponent, {layer:uiRoot})

    return uiEntity
}