import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/CardMedia',
  component: Component,
  parameters: {
    componentSubtitle: 'CardMedia',
    jest: 'CardMedia.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
