import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ThemeSwitcher from './index'

const argTypes = {}

export default {
  title: 'Components/Tailwind/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    componentSubtitle: 'ThemeSwitcher',
    jest: 'ThemeSwitcher.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ThemeSwitcher>

const Template: ComponentStory<typeof ThemeSwitcher> = (args) => <ThemeSwitcher {...args} />

export const Default = Template.bind({})
Default.args = ThemeSwitcher.defaultProps
