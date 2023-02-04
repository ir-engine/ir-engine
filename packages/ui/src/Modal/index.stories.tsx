import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Modal from './index'

const argTypes = {}

export default {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    componentSubtitle: 'Modal',
    jest: 'Modal.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Modal>

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />

export const Default = Template.bind({})
Default.args = Modal.defaultProps
