import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import DialogContentText from './index'

const argTypes = {}

export default {
  title: 'Components/DialogContentText',
  component: DialogContentText,
  parameters: {
    componentSubtitle: 'DialogContentText',
    jest: 'DialogContentText.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof DialogContentText>

const Template: ComponentStory<typeof DialogContentText> = (args) => <DialogContentText {...args} />

export const Default = Template.bind({})
Default.args = DialogContentText.defaultProps
