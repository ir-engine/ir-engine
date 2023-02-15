import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Tabs from './index'

const argTypes = {}

export default {
  title: 'MUI/Tabs',
  component: Tabs,
  parameters: {
    componentSubtitle: 'Tabs',
    jest: 'Tabs.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <div role="tabpanel" hidden={false}>
          Hello
        </div>
      </>
    )
  ],
  argTypes
} as ComponentMeta<typeof Tabs>

const Template: ComponentStory<typeof Tabs> = (args) => <Tabs {...args} />

export const Default = Template.bind({})
Default.args = Tabs.defaultProps
