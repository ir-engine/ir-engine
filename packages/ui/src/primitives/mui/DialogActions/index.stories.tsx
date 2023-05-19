import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/DialogActions',
  component: Component,
  parameters: {
    componentSubtitle: 'DialogActions',
    jest: 'DialogActions.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
