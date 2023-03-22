import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Modal from './index'

const argTypes = {}

export default {
  title: 'MUI/Modal',
  component: Modal,
  parameters: {
    componentSubtitle: 'Modal',
    jest: 'Modal.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Modal>

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />

export const Default = Template.bind({})
Default.args = Modal.defaultProps
