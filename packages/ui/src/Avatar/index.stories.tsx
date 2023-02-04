import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Avatar from './index'

const argTypes = {}

export default {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    componentSubtitle: 'Avatar',
    jest: 'Avatar.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Avatar>

const Template: ComponentStory<typeof Avatar> = (args) => <Avatar {...args} />

export const Default = Template.bind({})
Default.args = Avatar.defaultProps
