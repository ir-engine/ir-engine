import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Container from './index'

const argTypes = {}

export default {
  title: 'MUI/Container',
  component: Container,
  parameters: {
    componentSubtitle: 'Container',
    jest: 'Container.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Container>

const Template: ComponentStory<typeof Container> = (args) => <Container {...args} />

export const Default = Template.bind({})
Default.args = Container.defaultProps
