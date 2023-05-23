import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Modal',
  component: Component,
  parameters: {
    componentSubtitle: 'Modal',
    jest: 'Modal.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
