import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/List',
  component: Component,
  parameters: {
    componentSubtitle: 'List',
    jest: 'List.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
