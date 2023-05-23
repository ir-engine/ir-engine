import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/OutlinedInput',
  component: Component,
  parameters: {
    componentSubtitle: 'OutlinedInput',
    jest: 'OutlinedInput.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
