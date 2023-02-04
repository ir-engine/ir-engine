import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import CardContent from './index'

const argTypes = {}

export default {
  title: 'Components/CardContent',
  component: CardContent,
  parameters: {
    componentSubtitle: 'CardContent',
    jest: 'CardContent.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof CardContent>

const Template: ComponentStory<typeof CardContent> = (args) => <CardContent {...args} />

export const Default = Template.bind({})
Default.args = CardContent.defaultProps
