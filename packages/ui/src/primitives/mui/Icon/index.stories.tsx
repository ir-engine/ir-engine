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

import React from 'react'

import IconsPage from './IconsPage'
import Component from './index'

const argTypes = {
  type: {
    control: { type: 'select' },
    options: [
      'Accessibility',
      'AccountCircle',
      'Add',
      'AdminPanelSettings',
      'Anchor',
      'ArrowBack',
      'ArrowBackIos',
      'ArrowDropDown',
      'ArrowForwardIos',
      'Autorenew',
      'Block',
      'BlurLinear',
      'BlurOff',
      'CachedOutlined',
      'CalendarViewDay',
      'Cancel',
      'CancelOutlined',
      'Chat',
      'ChatBubble',
      'Check',
      'CheckCircle',
      'CleaningServices',
      'Clear',
      'Close',
      'CloudUpload',
      'Code',
      'ContactMail',
      'ContentCopy',
      'Create',
      'CrisisAlert',
      'Dashboard',
      'Delete',
      'Difference',
      'DirectionsRun',
      'Edit',
      'Email',
      'ErrorOutline',
      'ExpandMore',
      'Face',
      'Facebook',
      'FacebookOutlined',
      'FaceRetouchingOff',
      'FileCopy',
      'FileUpload',
      'FilterList',
      'FormatColorFill',
      'FormatColorReset',
      'FullscreenExit',
      'GitHub',
      'Google',
      'GridOn',
      'Group',
      'Groups',
      'Help',
      'HighlightOff',
      'HowToReg',
      'Hub',
      'IosShare',
      'KeyboardArrowDown',
      'KeyboardArrowUp',
      'KeyboardDoubleArrowDown',
      'KeyboardDoubleArrowUp',
      'Launch',
      'Link',
      'LinkedIn',
      'LinkOff',
      'List',
      'ListAlt',
      'LocationOn',
      'Lock',
      'LockOutlined',
      'MailOutline',
      'Menu',
      'Message',
      'Mic',
      'MicOff',
      'Mouse',
      'NavigateBefore',
      'NavigateNext',
      'NearMe',
      'Newspaper',
      'People',
      'PermIdentity',
      'PermMedia',
      'Person',
      'PersonAdd',
      'Phone',
      'Portrait',
      'QrCode2',
      'RecordVoiceOver',
      'Refresh',
      'Report',
      'ScreenShare',
      'ScreenshotMonitor',
      'Search',
      'SelectAll',
      'Send',
      'Settings',
      'Shuffle',
      'SquareFoot',
      'StopScreenShare',
      'Storage',
      'SupervisorAccount',
      'SurroundSound',
      'SystemUpdateAlt',
      'TextSnippet',
      'Timeline',
      'TouchApp',
      'Toys',
      'Twitter',
      'Upload',
      'Videocam',
      'VideocamOff',
      'ViewCompact',
      'ViewInAr',
      'Visibility',
      'VisibilityOff',
      'VoiceOverOff',
      'VolumeDown',
      'VolumeMute',
      'VolumeOff',
      'VolumeUp',
      'WarningAmber',
      'ZoomOutMap',
      'ChevronLeft',
      'ChevronRight',
      'Sync',
      'Download',
      'Save'
    ]
  }
}

export default {
  title: 'Primitives/MUI/Icon',
  component: Component,
  parameters: {
    componentSubtitle: 'Icon',
    jest: 'Icon.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }

export const AllIcons = {
  decorators: [
    () => {
      return <IconsPage argTypes={argTypes} />
    }
  ],
  args: Component.defaultProps
}
