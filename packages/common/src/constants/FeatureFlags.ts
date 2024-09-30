/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

export const FeatureFlags = {
  Client: {
    Menu: {
      Social: 'ir.client.menu.social',
      Emote: 'ir.client.menu.emote',
      Avaturn: 'ir.client.menu.avaturn',
      ReadyPlayerMe: 'ir.client.menu.readyPlayerMe',
      CreateAvatar: 'ir.client.menu.createAvatar',
      MotionCapture: 'ir.client.location.menu.motionCapture',
      XR: 'ir.client.menu.xr'
    }
  },
  Studio: {
    Model: {
      Dereference: 'ir.studio.model.dereference'
    },
    Panel: {
      VisualScript: 'ir.editor.panel.visualScript'
    },
    UI: {
      TransformPivot: 'ir.editor.ui.transformPivot',
      Hierarchy: {
        ShowModelChildren: 'ir.editor.ui.hierarchy.showModelChildren'
      },
      PointClick: 'ir.editor.ui.pointClick'
    }
  }
}
