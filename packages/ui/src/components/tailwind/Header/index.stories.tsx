import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/Header',
  component: Component,
  parameters: {
    componentSubtitle: 'Header',
    jest: 'Header.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
