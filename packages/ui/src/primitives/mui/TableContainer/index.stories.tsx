import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TableContainer',
  component: Component,
  parameters: {
    componentSubtitle: 'TableContainer',
    jest: 'TableContainer.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
