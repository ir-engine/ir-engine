/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
