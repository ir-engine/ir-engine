import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/ListItemAvatar',
  component: Component,
  parameters: {
    componentSubtitle: 'ListItemAvatar',
    jest: 'ListItemAvatar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
