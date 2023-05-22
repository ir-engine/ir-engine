import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/ToggleButtonGroup',
  component: Component,
  parameters: {
    componentSubtitle: 'ToggleButtonGroup',
    jest: 'ToggleButtonGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
