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
import { useTranslation } from 'react-i18next'

import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import { ClientThemeOptionsType } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import Divider from '@etherealengine/ui/src/primitives/mui/Divider'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import SketchColorPicker from '../../../common/SketchColorPicker'
import styles from '../../../styles/settings.module.scss'

interface ColorSelectionAreaProps {
  mode: string
  colorModes: string[]
  theme: ClientThemeOptionsType
  onChangeMode: (e: React.ChangeEvent<HTMLInputElement>) => void
  onChangeColor: (name: string, color: string) => void
}

const ColorSelectionArea = ({ mode, colorModes, theme, onChangeMode, onChangeColor }: ColorSelectionAreaProps) => {
  const { t } = useTranslation()

  const colorModesMenu: InputMenuItem[] = colorModes.map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  return (
    <Grid container>
      <Grid item sm={12} md={12} marginTop="25px">
        <InputRadio
          name="mode"
          label={t('admin:components.setting.theme')}
          value={mode}
          options={colorModesMenu}
          onChange={(e) => onChangeMode(e)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={12} className={styles.colorGridContainer}>
        <label>Main Background:</label>
        <SketchColorPicker
          name="mainBackground"
          value={theme.mainBackground}
          onChange={(color) => onChangeColor('mainBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Navbar Background:</label>
        <SketchColorPicker
          name="navbarBackground"
          value={theme.navbarBackground}
          onChange={(color) => onChangeColor('navbarBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Editor Dock Background:</label>
        <SketchColorPicker
          name="dockBackground"
          value={theme.dockBackground}
          onChange={(color) => onChangeColor('dockBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Sidebar Background:</label>
        <SketchColorPicker
          name="sidebarBackground"
          value={theme.sidebarBackground}
          onChange={(color) => onChangeColor('sidebarBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Sibebar Selected Background:</label>
        <SketchColorPicker
          name="sidebarSelectedBackground"
          value={theme.sidebarSelectedBackground}
          onChange={(color) => onChangeColor('sidebarSelectedBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Table Header Background:</label>
        <SketchColorPicker
          name="tableHeaderBackground"
          value={theme.tableHeaderBackground}
          onChange={(color) => onChangeColor('tableHeaderBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Table Cell Background:</label>
        <SketchColorPicker
          name="tableCellBackground"
          value={theme.tableCellBackground}
          onChange={(color) => onChangeColor('tableCellBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={12} className={styles.colorGridContainer}>
        <label>Table Footer Background:</label>
        <SketchColorPicker
          name="tableFooterBackground"
          value={theme.tableFooterBackground}
          onChange={(color) => onChangeColor('tableFooterBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Color:</label>
        <SketchColorPicker
          name="textColor"
          value={theme.textColor}
          onChange={(color) => onChangeColor('textColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Heading:</label>
        <SketchColorPicker
          name="textHeading"
          value={theme.textHeading}
          onChange={(color) => onChangeColor('textHeading', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Subheading:</label>
        <SketchColorPicker
          name="textSubheading"
          value={theme.textSubheading}
          onChange={(color) => onChangeColor('textSubheading', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Description:</label>
        <SketchColorPicker
          name="textDescription"
          value={theme.textDescription}
          onChange={(color) => onChangeColor('textDescription', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Background:</label>
        <SketchColorPicker
          name="panelBackground"
          value={theme.panelBackground}
          onChange={(color) => onChangeColor('panelBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Background:</label>
        <SketchColorPicker
          name="panelCards"
          value={theme.panelCards}
          onChange={(color) => onChangeColor('panelCards', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Hover Outline:</label>
        <SketchColorPicker
          name="panelCardHoverOutline"
          value={theme.panelCardHoverOutline}
          onChange={(color) => onChangeColor('panelCardHoverOutline', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Icon Color:</label>
        <SketchColorPicker
          name="panelCardIcon"
          value={theme.panelCardIcon}
          onChange={(color) => onChangeColor('panelCardIcon', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Color:</label>
        <SketchColorPicker
          name="iconButtonColor"
          value={theme.iconButtonColor}
          onChange={(color) => onChangeColor('iconButtonColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Background:</label>
        <SketchColorPicker
          name="iconButtonBackground"
          value={theme.iconButtonBackground}
          onChange={(color) => onChangeColor('iconButtonBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Hover Background/Color:</label>
        <SketchColorPicker
          name="iconButtonHoverColor"
          value={theme.iconButtonHoverColor}
          onChange={(color) => onChangeColor('iconButtonHoverColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Selected Background:</label>
        <SketchColorPicker
          name="iconButtonSelectedBackground"
          value={theme.iconButtonSelectedBackground}
          onChange={(color) => onChangeColor('iconButtonSelectedBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Text Color:</label>
        <SketchColorPicker
          name="buttonTextColor"
          value={theme.buttonTextColor}
          onChange={(color) => onChangeColor('buttonTextColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Outlined:</label>
        <SketchColorPicker
          name="buttonOutlined"
          value={theme.buttonOutlined}
          onChange={(color) => onChangeColor('buttonOutlined', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Filled:</label>
        <SketchColorPicker
          name="buttonFilled"
          value={theme.buttonFilled}
          onChange={(color) => onChangeColor('buttonFilled', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Gradient:</label>
        <SketchColorPicker
          name="buttonGradientStart"
          value={theme.buttonGradientStart}
          onChange={(color) => onChangeColor('buttonGradientStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="buttonGradientEnd"
          value={theme.buttonGradientEnd}
          onChange={(color) => onChangeColor('buttonGradientEnd', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Thumb X-Axis Gradient:</label>
        <SketchColorPicker
          name="scrollbarThumbXAxisStart"
          value={theme.scrollbarThumbXAxisStart}
          onChange={(color) => onChangeColor('scrollbarThumbXAxisStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="scrollbarThumbXAxisEnd"
          value={theme.scrollbarThumbXAxisEnd}
          onChange={(color) => onChangeColor('scrollbarThumbXAxisEnd', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Thumb Y-Axis Gradient:</label>
        <SketchColorPicker
          name="scrollbarThumbYAxisStart"
          value={theme.scrollbarThumbYAxisStart}
          onChange={(color) => onChangeColor('scrollbarThumbYAxisStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="scrollbarThumbYAxisEnd"
          value={theme.scrollbarThumbYAxisEnd}
          onChange={(color) => onChangeColor('scrollbarThumbYAxisEnd', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Corner:</label>
        <SketchColorPicker
          name="scrollbarCorner"
          value={theme.scrollbarCorner}
          onChange={(color) => onChangeColor('scrollbarCorner', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Input Outline:</label>
        <SketchColorPicker
          name="inputOutline"
          value={theme.inputOutline}
          onChange={(color) => onChangeColor('inputOutline', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Input Background:</label>
        <SketchColorPicker
          name="inputBackground"
          value={theme.inputBackground}
          onChange={(color) => onChangeColor('inputBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Background:</label>
        <SketchColorPicker
          name="dropdownMenuBackground"
          value={theme.dropdownMenuBackground}
          onChange={(color) => onChangeColor('dropdownMenuBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Hover Background:</label>
        <SketchColorPicker
          name="dropdownMenuHoverBackground"
          value={theme.dropdownMenuHoverBackground}
          onChange={(color) => onChangeColor('dropdownMenuHoverBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Selected Background:</label>
        <SketchColorPicker
          name="dropdownMenuSelectedBackground"
          value={theme.dropdownMenuSelectedBackground}
          onChange={(color) => onChangeColor('dropdownMenuSelectedBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Drawer Background:</label>
        <SketchColorPicker
          name="drawerBackground"
          value={theme.drawerBackground}
          onChange={(color) => onChangeColor('drawerBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Popup Background:</label>
        <SketchColorPicker
          name="popupBackground"
          value={theme.popupBackground}
          onChange={(color) => onChangeColor('popupBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
    </Grid>
  )
}

export default ColorSelectionArea
