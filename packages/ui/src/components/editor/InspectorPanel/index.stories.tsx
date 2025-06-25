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
    <div className="min-h-[500px] w-[400px]">
      <InspectorPanel data={args} />
    </div>
  )
}

export const InspectorWithData: StoryObj = {
  name: 'Inspector with asset',
  args: {
    thumbnail: './apartment_scene.png',
    name: 'apartment_scene.png',
    type: 'png',
    author: 'Napster 3D Studio',
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
