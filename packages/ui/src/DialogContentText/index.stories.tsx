import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import DialogContentText from './index'

const argTypes = {}

export default {
  title: 'MUI/DialogContentText',
  component: DialogContentText,
  parameters: {
    componentSubtitle: 'DialogContentText',
    jest: 'DialogContentText.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof DialogContentText>

const Template: ComponentStory<typeof DialogContentText> = (args) => <DialogContentText {...args} />

export const Default = Template.bind({})
Default.args = DialogContentText.defaultProps
