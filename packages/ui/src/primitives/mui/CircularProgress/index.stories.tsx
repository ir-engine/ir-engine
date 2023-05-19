import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/CircularProgress',
  component: Component,
  parameters: {
    componentSubtitle: 'CircularProgress',
    jest: 'CircularProgress.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
