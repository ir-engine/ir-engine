import Component from './index'

const argTypes = {}

export default {
  title: 'Admin/Sidebar',
  component: Component,
  parameters: {
    componentSubtitle: 'Sidebar',
    jest: 'Sidebar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
