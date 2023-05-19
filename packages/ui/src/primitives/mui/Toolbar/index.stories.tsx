import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Toolbar',
  component: Component,
  parameters: {
    componentSubtitle: 'Toolbar',
    jest: 'Toolbar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
