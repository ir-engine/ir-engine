import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Card',
  component: Component,
  parameters: {
    componentSubtitle: 'Card',
    jest: 'Card.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
