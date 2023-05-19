import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/FormHelperText',
  component: Component,
  parameters: {
    componentSubtitle: 'FormHelperText',
    jest: 'FormHelperText.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
