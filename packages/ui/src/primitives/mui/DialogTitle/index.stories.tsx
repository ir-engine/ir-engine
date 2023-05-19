import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/DialogTitle',
  component: Component,
  parameters: {
    componentSubtitle: 'DialogTitle',
    jest: 'DialogTitle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
