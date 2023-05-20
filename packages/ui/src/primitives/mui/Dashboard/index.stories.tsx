import Component from './index'

const argTypes = {}

export default {
  title: 'Admin/Dashboard',
  component: Component,
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
}

export const Primary = { args: Component.defaultProps }
