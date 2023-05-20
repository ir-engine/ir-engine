import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Dialog',
  component: Component,
  parameters: {
    componentSubtitle: 'Dialog',
    jest: 'Dialog.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
