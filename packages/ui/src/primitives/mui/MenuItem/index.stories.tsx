import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/MenuItem',
  component: Component,
  parameters: {
    componentSubtitle: 'MenuItem',
    jest: 'MenuItem.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
