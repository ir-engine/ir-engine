import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Dashboard from './index'

const argTypes = {}

export default {
  title: 'Admin/Dashboard',
  component: Dashboard,
  parameters: {
    componentSubtitle: 'Dashboard',
    jest: 'Dashboard.test.tsx',
    design: {
      type: 'figma',
      url: ''
    },
    reactRouter: {
      routePath: '/admin',
      routeParams: {}
    }
  },
  argTypes
} as ComponentMeta<typeof Dashboard>

const Template: ComponentStory<typeof Dashboard> = (args) => <Dashboard {...args} />

export const Default = Template.bind({})
Default.args = Dashboard.defaultProps
