import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Select',
  component: Component,
  parameters: {
    componentSubtitle: 'Select',
    jest: 'Select.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
