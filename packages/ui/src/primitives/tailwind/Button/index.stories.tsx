import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/Button',
  component: Component,
  parameters: {
    componentSubtitle: 'Button',
    jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
