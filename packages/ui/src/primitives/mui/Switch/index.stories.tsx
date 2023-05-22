import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Switch',
  component: Component,
  parameters: {
    componentSubtitle: 'Switch',
    jest: 'Switch.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
