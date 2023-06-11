import Component from './index'

const argTypes = {}

export default {
  title: 'Components/Tailwind/ThemeSwitcher',
  component: Component,
  parameters: {
    componentSubtitle: 'ThemeSwitcher',
    jest: 'ThemeSwitcher.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
