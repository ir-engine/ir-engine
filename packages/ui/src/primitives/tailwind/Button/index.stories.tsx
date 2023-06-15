import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/Button',
  component: Component,
  parameters: {
    componentSubtitle: 'Button',
    jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }

export const LabelLeft = {
  args: {
    ...Component.defaultProps,
    title: 'left',
    labelPosition: 'left'
  }
}

export const LabelAbove = {
  args: {
    ...Component.defaultProps,
    title: 'above',
    labelPosition: 'above'
  }
}

export const LabelBelow = {
  args: {
    ...Component.defaultProps,
    title: 'below',
    labelPosition: 'below'
  }
}
