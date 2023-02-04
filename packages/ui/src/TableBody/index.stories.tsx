import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableBody from './index'

const argTypes = {}

export default {
  title: 'Components/TableBody',
  component: TableBody,
  parameters: {
    componentSubtitle: 'TableBody',
    jest: 'TableBody.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableBody>

const Template: ComponentStory<typeof TableBody> = (args) => <TableBody {...args} />

export const Default = Template.bind({})
Default.args = TableBody.defaultProps
