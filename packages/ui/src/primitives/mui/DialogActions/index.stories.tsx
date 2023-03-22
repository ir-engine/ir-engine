import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import DialogActions from './index'

const argTypes = {}

export default {
  title: 'MUI/DialogActions',
  component: DialogActions,
  parameters: {
    componentSubtitle: 'DialogActions',
    jest: 'DialogActions.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof DialogActions>

const Template: ComponentStory<typeof DialogActions> = (args) => <DialogActions {...args} />

export const Default = Template.bind({})
Default.args = DialogActions.defaultProps
