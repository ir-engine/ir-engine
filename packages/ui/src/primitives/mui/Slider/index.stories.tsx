import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Slider',
  component: Component,
  parameters: {
    componentSubtitle: 'Slider',
    jest: 'Slider.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
