import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Tooltip',
  component: Component,
  parameters: {
    componentSubtitle: 'Tooltip',
    jest: 'Tooltip.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Primary = { args: Component.defaultProps }
