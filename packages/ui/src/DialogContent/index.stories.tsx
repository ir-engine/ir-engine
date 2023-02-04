import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import DialogContent from './index'

const argTypes = {}

export default {
  title: 'Components/DialogContent',
  component: DialogContent,
  parameters: {
    componentSubtitle: 'DialogContent',
    jest: 'DialogContent.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof DialogContent>

const Template: ComponentStory<typeof DialogContent> = (args) => <DialogContent {...args} />

export const Default = Template.bind({})
Default.args = DialogContent.defaultProps
