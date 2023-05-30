import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/ListItemSecondaryAction',
  component: Component,
  parameters: {
    componentSubtitle: 'ListItemSecondaryAction',
    jest: 'ListItemSecondaryAction.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
