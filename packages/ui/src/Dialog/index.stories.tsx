import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Dialog from './index'

const argTypes = {}

export default {
  title: 'MUI/Dialog',
  component: Dialog,
  parameters: {
    componentSubtitle: 'Dialog',
    jest: 'Dialog.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Dialog>

const Template: ComponentStory<typeof Dialog> = (args) => <Dialog {...args} />

export const Default = Template.bind({})
Default.args = Dialog.defaultProps
