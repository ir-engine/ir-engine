import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Tab',
  component: Component,
  parameters: {
    componentSubtitle: 'Tab',
    jest: 'Tab.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
