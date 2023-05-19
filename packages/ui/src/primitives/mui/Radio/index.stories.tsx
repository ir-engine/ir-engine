import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Radio',
  component: Component,
  parameters: {
    componentSubtitle: 'Radio',
    jest: 'Radio.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
