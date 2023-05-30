import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TextField',
  component: Component,
  parameters: {
    componentSubtitle: 'TextField',
    jest: 'TextField.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
