import { AssetMetadataType } from '@ir-engine/editor/src/systems/ClickPlacementSystem'
import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'
import InspectorPanel from './index'

const argTypes: ArgTypes = {}

export default {
  title: 'Components/Editor/Inspector',
  component: InspectorPanel,
  parameters: {},
  argTypes
}

const InspectorRender = (args: AssetMetadataType) => {
  return (
    <div className="h-[500px] w-[400px]">
      <InspectorPanel data={args} />
    </div>
  )
}

export const InspectorWithData: StoryObj = {
  name: 'Inspector with asset',
  args: {
    thumbnail: 'hellworld.jpeg',
    name: 'Hello World.jpeg',
    type: 'jpeg',
    author: 'iR Studio',
    dateCreated: '2025-05-13T16:58:59.000Z',
    fileSize: '',
    dimensions: {},
    mesh: '',
    resources: '',
    tags: ['Image']
  },
  render: InspectorRender
}

export const Default = { name: 'Default', render: InspectorRender }
