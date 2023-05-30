import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/RadioGroup',
  component: Component,
  parameters: {
    componentSubtitle: 'RadioGroup',
    jest: 'RadioGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
