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

import MenuIcon from '@mui/icons-material/Menu'

import DropDownMenu from '../dropDownMenu'
import { EditorNavbarProfile } from '../projects/EditorNavbarProfile'
import { WorldInstanceConnection } from '../realtime/WorldInstanceConnection'
import * as styles from './styles.module.scss'
import GridTool from './tools/GridTool'
import HelperToggleTool from './tools/HelperToggleTool'
import PlayModeTool from './tools/PlayModeTool'
import RenderModeTool from './tools/RenderModeTool'
import SceneScreenshot from './tools/SceneScreenshot'
import StatsTool from './tools/StatsTool'
import TransformPivotTool from './tools/TransformPivotTool'
import TransformSnapTool from './tools/TransformSnapTool'
import TransformSpaceTool from './tools/TransformSpaceTool'
import TransformTool from './tools/TransformTool'

type ToolBarProps = {
  menu?: any
}

export const ToolBar = (props: ToolBarProps) => {
  return (
    <div style={{ pointerEvents: 'auto' }} className={styles.toolbarContainer}>
      <DropDownMenu icon={MenuIcon} commands={props.menu} />
      <WorldInstanceConnection />
      <TransformTool />
      <TransformSpaceTool />
      <TransformPivotTool />
      <TransformSnapTool />
      <GridTool />
      <RenderModeTool />
      <PlayModeTool />
      <StatsTool />
      <HelperToggleTool />
      <SceneScreenshot />
      <EditorNavbarProfile />
    </div>
  )
}

export default ToolBar
