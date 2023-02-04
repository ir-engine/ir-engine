import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Collapse from './index'

const argTypes = {}

export default {
  title: 'Components/Collapse',
  component: Collapse,
  parameters: {
    componentSubtitle: 'Collapse',
    jest: 'Collapse.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Collapse>

const Template: ComponentStory<typeof Collapse> = (args) => <Collapse {...args} />

export const Default = Template.bind({})
Default.args = Collapse.defaultProps
