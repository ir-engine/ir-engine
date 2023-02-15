import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import SvgIcon from './index'

const argTypes = {}

export default {
  title: 'MUI/SvgIcon',
  component: SvgIcon,
  parameters: {
    componentSubtitle: 'SvgIcon',
    jest: 'SvgIcon.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof SvgIcon>

const Template: ComponentStory<typeof SvgIcon> = (args) => <SvgIcon {...args} />

export const Default = Template.bind({})
Default.args = SvgIcon.defaultProps
