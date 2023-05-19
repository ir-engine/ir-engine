import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Grid',
  component: Component,
  parameters: {
    componentSubtitle: 'Grid',
    jest: 'Grid.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
