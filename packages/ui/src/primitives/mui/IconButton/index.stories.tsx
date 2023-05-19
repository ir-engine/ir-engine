import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/IconButton',
  component: Component,
  parameters: {
    componentSubtitle: 'Basic Icon Button',
    jest: 'IconButton.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
