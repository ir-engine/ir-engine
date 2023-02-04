import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Icon from './index'

const argTypes = {}

export default {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    componentSubtitle: 'Icon',
    jest: 'Icon.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Icon>

const Template: ComponentStory<typeof Icon> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.args = Icon.defaultProps
