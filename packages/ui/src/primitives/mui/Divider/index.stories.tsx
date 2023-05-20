import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Divider',
  component: Component,
  parameters: {
    componentSubtitle: 'Divider',
    jest: 'Divider.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
