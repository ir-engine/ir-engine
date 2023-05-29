import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/DialogContent',
  component: Component,
  parameters: {
    componentSubtitle: 'DialogContent',
    jest: 'DialogContent.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
