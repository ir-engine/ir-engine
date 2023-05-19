import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/FormControl',
  component: Component,
  parameters: {
    componentSubtitle: 'FormControl',
    jest: 'FormControl.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
