import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Typography',
  component: Component,
  parameters: {
    componentSubtitle: 'Typography',
    jest: 'Typography.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
