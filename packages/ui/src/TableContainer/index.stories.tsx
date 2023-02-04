import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableContainer from './index'

const argTypes = {}

export default {
  title: 'Components/TableContainer',
  component: TableContainer,
  parameters: {
    componentSubtitle: 'TableContainer',
    jest: 'TableContainer.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableContainer>

const Template: ComponentStory<typeof TableContainer> = (args) => <TableContainer {...args} />

export const Default = Template.bind({})
Default.args = TableContainer.defaultProps
