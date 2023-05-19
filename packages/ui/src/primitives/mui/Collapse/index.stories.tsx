import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Collapse',
  component: Component,
  parameters: {
    componentSubtitle: 'Collapse',
    jest: 'Collapse.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
