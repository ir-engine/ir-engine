import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Table',
  component: Component,
  parameters: {
    componentSubtitle: 'Table',
    jest: 'Table.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
