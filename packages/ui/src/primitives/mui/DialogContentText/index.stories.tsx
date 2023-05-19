import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/DialogContentText',
  component: Component,
  parameters: {
    componentSubtitle: 'DialogContentText',
    jest: 'DialogContentText.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
