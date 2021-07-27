import React, { useEffect, useState as useStateReact } from 'react'
import { StyleSheetManager, ThemeProvider } from 'styled-components'

import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { UIRootComponent } from '../components/UIRootComponent'
import { UIComponent } from '../components/UIComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { Engine } from '../../ecs/classes/Engine'

let depsLoaded: Promise<[typeof import('ethereal'), typeof import('react-dom')]>

async function createUIRootLayer<S extends unknown>(UIFunc: React.FC<{ state: S }>, state: S, theme: any) {
  const [Ethereal, ReactDOM] = await (depsLoaded = depsLoaded || Promise.all([import('ethereal'), import('react-dom')]))

  const UI = () => (
    <ThemeProvider theme={theme}>
      <UIFunc state={state} />
    </ThemeProvider>
  )

  const GenerateStyles = (props: { children: (props: { styles: string }) => JSX.Element }) => {
    const [styles, setStyles] = useStateReact('')
    useEffect(() => {
      const target = document.createElement('div')
      ReactDOM.render(
        <StyleSheetManager target={target}>
          <UI />
        </StyleSheetManager>,
        document.createElement('div'),
        () => {
          const newStyles = target.innerHTML
          if (styles !== newStyles) setStyles(newStyles)
        }
      )
    })
    return props.children({ styles })
  }

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  const stylesContainer = document.createElement('div')
  stylesContainer.className = 'styles'
  containerElement.appendChild(stylesContainer)

  ReactDOM.render(
    <GenerateStyles>
      {({ styles }) => (
        <>
          <div data-styles dangerouslySetInnerHTML={{ __html: styles }} />
          <UI />
        </>
      )}
    </GenerateStyles>,
    containerElement
  )

  // ReactDOM.render(<UI/>, containerElement)

  const uiRoot = new Ethereal.WebLayer3D(containerElement, {
    onLayerCreate: (layer) => {
      const layerEntity = createEntity()
      addComponent(layerEntity, UIComponent, { layer })
    }
  })

  return uiRoot
}

export function createUI<S>(UIFunc: React.FC<{ state: S }>, state: S, theme = {}): XRUI<S> {
  const entity = createEntity()
  createUIRootLayer(UIFunc, state, theme).then((uiRoot) => {
    // Make sure entity still exists, since we are adding these components asynchronously,
    // and bad things might happen if we add these components after entity has been removed
    // TODO: revise this pattern after refactor
    if (Engine.entities.indexOf(entity) === -1) return
    addComponent(entity, Object3DComponent, { value: uiRoot })
    addComponent(entity, UIRootComponent, { layer: uiRoot })
  })
  return { entity, state }
}

export interface XRUI<S> {
  entity: Entity
  state: S
}
