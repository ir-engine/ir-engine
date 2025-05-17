/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  createEntity,
  EntityID,
  EntityUUIDPair,
  getComponent,
  removeEntity,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { ArgTypes } from '@storybook/react'
import React, { useEffect } from 'react'
import { BakePropertyTypes } from '..'
import Component from './index'

const argTypes: ArgTypes = {
  bakePropertyTypes: {
    control: { type: 'select' },
    options: ['Boolean', 'BakeType', 'RefreshMode', 'Resolution', 'Vector']
  }
}

export default {
  title: 'Editor/Properties/EnvMapBake/Properties',
  component: Component,
  parameters: {
    componentSubtitle: 'EnvMapBakePropertiesNodeEditor',
    jest: 'envMapBakePropertiesNodeEditor.test.tsx',
    design: {
      type: 'figma',
      url: ''
    },
    chromatic: { disable: true }
  },

  argTypes
}

const ComponentNodeEditorRenderer = (args) => {
  console.log('args', args)
  const entity = createEntity()
  setComponent(entity, EnvMapBakeComponent)
  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  setComponent(entity, UUIDComponent, {
    entitySourceID: 'storybook' as SourceID,
    entityID: 'root' as EntityID
  } as EntityUUIDPair)

  useEffect(() => {
    return () => {
      removeEntity(entity)
    }
  }, [])

  let bakeProperty
  switch (args.bakePropertyTypes) {
    case 'Boolean':
      bakeProperty = BakePropertyTypes.Boolean
      break
    case 'BakeType':
      bakeProperty = BakePropertyTypes.BakeType
      break
    case 'RefreshMode':
      bakeProperty = BakePropertyTypes.RefreshMode
      break
    case 'Resolution':
      bakeProperty = BakePropertyTypes.Resolution
      break
    case 'Vector':
      bakeProperty = BakePropertyTypes.Vector
      break
  }
  const element = { type: bakeProperty, label: 'test', propertyName: 'test-property-name' }

  return <Component entity={entity} bakeComponent={bakeComponent} element={element} />
}

export const Default = {
  render: ComponentNodeEditorRenderer,
  args: {
    bakePropertyTypes: 'Boolean'
  }
}
