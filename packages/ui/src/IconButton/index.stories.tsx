import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import IconButton from './index'

const argTypes = {}

export default {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    componentSubtitle: 'Basic Icon Button',
    jest: 'IconButton.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof IconButton>

const Template: ComponentStory<typeof IconButton> = (args) => <IconButton {...args} />

export const Default = Template.bind({})
Default.args = IconButton.defaultProps
