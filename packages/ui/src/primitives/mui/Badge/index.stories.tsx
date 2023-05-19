import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Badge',
  component: Component,
  parameters: {
    componentSubtitle: 'Badge',
    jest: 'Badge.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
