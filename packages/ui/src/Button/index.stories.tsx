import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Button from './index'

const argTypes = {}

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    componentSubtitle: 'Button',
    jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const Default = Template.bind({})
Default.args = Button.defaultProps
