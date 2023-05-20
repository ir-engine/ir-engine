import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/AppBar',
  component: Component,
  parameters: {
    componentSubtitle: 'AppBar',
    jest: 'AppBar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Primary = { args: Component.defaultProps }
