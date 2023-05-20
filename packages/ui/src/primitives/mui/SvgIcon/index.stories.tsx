import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/SvgIcon',
  component: Component,
  parameters: {
    componentSubtitle: 'SvgIcon',
    jest: 'SvgIcon.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
