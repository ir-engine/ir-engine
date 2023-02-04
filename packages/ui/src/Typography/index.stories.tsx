import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Typography from './index'

const argTypes = {}

export default {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    componentSubtitle: 'Typography',
    jest: 'Typography.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Typography>

const Template: ComponentStory<typeof Typography> = (args) => <Typography {...args} />

export const Default = Template.bind({})
Default.args = Typography.defaultProps
