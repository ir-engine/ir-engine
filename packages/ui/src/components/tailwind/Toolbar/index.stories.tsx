import Component from './index'

const argTypes = {}

export default {
  title: 'Capture/Toolbar',
  component: Component,
  parameters: {
    componentSubtitle: 'Toolbar',
    jest: 'Toolbar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }

export const CameraLoading = {
  args: {
    ...Component.defaultProps,
    isRecording: true,
    videoStatus: 'loading'
  }
}
export const CameraReady = {
  args: {
    ...Component.defaultProps,
    isRecording: true,
    videoStatus: 'ready'
  }
}

export const CameraOn = {
  args: {
    ...Component.defaultProps,
    isRecording: true,
    videoStatus: 'active'
  }
}
