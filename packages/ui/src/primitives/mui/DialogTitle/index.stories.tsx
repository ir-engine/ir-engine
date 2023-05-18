import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import DialogTitle from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/DialogTitle',
  component: DialogTitle,
  parameters: {
    componentSubtitle: 'DialogTitle',
    jest: 'DialogTitle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof DialogTitle>

const Template: ComponentStory<typeof DialogTitle> = (args) => <DialogTitle {...args} />

export const Default = Template.bind({})
Default.args = DialogTitle.defaultProps
