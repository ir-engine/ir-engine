import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Container',
  component: Component,
  parameters: {
    componentSubtitle: 'Container',
    jest: 'Container.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
