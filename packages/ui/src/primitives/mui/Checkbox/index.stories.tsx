import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Checkbox',
  component: Component,
  parameters: {
    componentSubtitle: 'Checkbox',
    jest: 'Checkbox.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
