import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/FormGroup',
  component: Component,
  parameters: {
    componentSubtitle: 'FormGroup',
    jest: 'FormGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
