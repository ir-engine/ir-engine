import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/LoadingCircle',
  component: Component,
  parameters: {
    componentSubtitle: 'LoadingCircle',
    jest: 'LoadingCircle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
