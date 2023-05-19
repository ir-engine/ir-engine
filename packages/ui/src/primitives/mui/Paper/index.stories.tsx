import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Paper',
  component: Component,
  parameters: {
    componentSubtitle: 'Paper',
    jest: 'Paper.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
