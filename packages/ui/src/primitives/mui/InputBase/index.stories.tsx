import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/InputBase',
  component: Component,
  parameters: {
    componentSubtitle: 'InputBase',
    jest: 'InputBase.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
