import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/ListItem',
  component: Component,
  parameters: {
    componentSubtitle: 'ListItem',
    jest: 'ListItem.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
