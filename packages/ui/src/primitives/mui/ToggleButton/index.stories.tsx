import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/ToggleButton',
  component: Component,
  parameters: {
    componentSubtitle: 'ToggleButton',
    jest: 'ToggleButton.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
