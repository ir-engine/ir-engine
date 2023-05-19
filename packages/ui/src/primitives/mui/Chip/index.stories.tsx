import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Chip',
  component: Component,
  parameters: {
    componentSubtitle: 'Chip',
    jest: 'Chip.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
