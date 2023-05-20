import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Menu',
  component: Component,
  parameters: {
    componentSubtitle: 'Menu',
    jest: 'Menu.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
