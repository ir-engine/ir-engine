import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/FullscreenContainer',
  component: Component,
  parameters: {
    componentSubtitle: 'FullscreenContainer',
    jest: 'FullscreenContainer.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
