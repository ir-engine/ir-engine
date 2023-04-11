import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import RecordingList from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/RecordingList',
  component: RecordingList,
  parameters: {
    componentSubtitle: 'RecordingList',
    jest: 'RecordingList.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof RecordingList>

const Template: ComponentStory<typeof RecordingList> = (args) => <RecordingList {...args} />

export const Default = Template.bind({})
Default.args = RecordingList.defaultProps
