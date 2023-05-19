import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Fade',
  component: Component,
  parameters: {
    componentSubtitle: 'Fade',
    jest: 'Fade.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
