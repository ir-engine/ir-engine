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

export const ShowLabels = {
  args: {
    ...Component.defaultProps,
    showLabels: true
  }
}

export const ButtonsSM = {
  args: {
    ...Component.defaultProps,
    buttonSize: 'sm'
  }
}

export const ButtonsMD = {
  args: {
    ...Component.defaultProps
  }
}

export const ButtonsLG = {
  args: {
    ...Component.defaultProps,
    buttonSize: 'lg'
  }
}

export const CameraLoading = {
  args: {
    ...Component.defaultProps,
    videoStatus: 'loading'
  }
}
export const CameraReady = {
  args: {
    ...Component.defaultProps,
    videoStatus: 'ready'
  }
}

export const CameraOn = {
  args: {
    ...Component.defaultProps,
    videoStatus: 'active'
  }
}

export const PoseLoading = {
  args: {
    ...CameraOn.args,
    detectingStatus: 'loading'
  }
}

export const PoseReady = {
  args: {
    ...CameraOn.args,
    detectingStatus: 'inactive'
  }
}

export const PoseDetecting = {
  args: {
    ...CameraOn.args,
    detectingStatus: 'active',
    recordingStatus: 'ready'
  }
}

export const RecordingLoading = {
  args: {
    ...PoseDetecting.args,
    recordingStatus: 'inactive',
    detectingStatus: 'inactive',
    isRecording: false
  }
}

export const RecordingReady = {
  args: {
    ...PoseDetecting.args,
    recordingStatus: 'ready',
    isRecording: false
  }
}

export const RecordingActive = {
  args: {
    ...PoseDetecting.args,
    recordingStatus: 'active',
    isRecording: true
  }
}
