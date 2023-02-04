import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import CardActionArea from './index'

const argTypes = {}

export default {
  title: 'Components/CardActionArea',
  component: CardActionArea,
  parameters: {
    componentSubtitle: 'CardActionArea',
    jest: 'CardActionArea.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof CardActionArea>

const Template: ComponentStory<typeof CardActionArea> = (args) => <CardActionArea {...args} />

export const Default = Template.bind({})
Default.args = CardActionArea.defaultProps
