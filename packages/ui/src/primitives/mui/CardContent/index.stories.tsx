import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/CardContent',
  component: Component,
  parameters: {
    componentSubtitle: 'CardContent',
    jest: 'CardContent.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
