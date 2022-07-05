import _ from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ThemeOptions } from '@xrengine/common/src/interfaces/ClientSetting'

import { Divider, Grid } from '@mui/material'

import InputRadio from '../../../common/InputRadio'
import { InputMenuItem } from '../../../common/InputSelect'
import SketchColorPicker from '../../../common/SketchColorPicker'
import styles from '../../../styles/settings.module.scss'

interface ColorSelectionAreaProps {
  mode: string
  themeModes: string[]
  theme: ThemeOptions
  handleChangeThemeMode: Function
  handleChangeColor: Function
}

const ColorSelectionArea = ({
  mode,
  themeModes,
  theme,
  handleChangeThemeMode,
  handleChangeColor
}: ColorSelectionAreaProps) => {
  const { t } = useTranslation()

  const modesMenu: InputMenuItem[] = themeModes.map((el) => {
    return {
      label: _.upperFirst(el),
      value: el
    }
  })

  return (
    <Grid container>
      <Grid item sm={12} md={12} marginTop="25px">
        <InputRadio
          name="mode"
          label={t('admin:components.setting.themeMode')}
          value={mode}
          options={modesMenu}
          onChange={(e) => handleChangeThemeMode(e)}
        />
      </Grid>
      <Grid item sm={12} md={12} className={styles.colorGridContainer}>
        <label>Main Background:</label>
        <SketchColorPicker
          name="mainBackground"
          value={theme.mainBackground}
          onChange={(color) => handleChangeColor('mainBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Navbar Background:</label>
        <SketchColorPicker
          name="navbarBackground"
          value={theme.navbarBackground}
          onChange={(color) => handleChangeColor('navbarBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Editor Dock Background:</label>
        <SketchColorPicker
          name="dockBackground"
          value={theme.dockBackground}
          onChange={(color) => handleChangeColor('dockBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Sidebar Background:</label>
        <SketchColorPicker
          name="sidebarBackground"
          value={theme.sidebarBackground}
          onChange={(color) => handleChangeColor('sidebarBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Sibebar Selected Background:</label>
        <SketchColorPicker
          name="sidebarSelectedBackground"
          value={theme.sidebarSelectedBackground}
          onChange={(color) => handleChangeColor('sidebarSelectedBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Table Header Background:</label>
        <SketchColorPicker
          name="tableHeaderBackground"
          value={theme.tableHeaderBackground}
          onChange={(color) => handleChangeColor('tableHeaderBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Table Cell Background:</label>
        <SketchColorPicker
          name="tableCellBackground"
          value={theme.tableCellBackground}
          onChange={(color) => handleChangeColor('tableCellBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={12} className={styles.colorGridContainer}>
        <label>Table Footer Background:</label>
        <SketchColorPicker
          name="tableFooterBackground"
          value={theme.tableFooterBackground}
          onChange={(color) => handleChangeColor('tableFooterBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Color:</label>
        <SketchColorPicker
          name="textColor"
          value={theme.textColor}
          onChange={(color) => handleChangeColor('textColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Heading:</label>
        <SketchColorPicker
          name="textHeading"
          value={theme.textHeading}
          onChange={(color) => handleChangeColor('textHeading', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Subheading:</label>
        <SketchColorPicker
          name="textSubheading"
          value={theme.textSubheading}
          onChange={(color) => handleChangeColor('textSubheading', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Text Description:</label>
        <SketchColorPicker
          name="textDescription"
          value={theme.textDescription}
          onChange={(color) => handleChangeColor('textDescription', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Background:</label>
        <SketchColorPicker
          name="panelBackground"
          value={theme.panelBackground}
          onChange={(color) => handleChangeColor('panelBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Background:</label>
        <SketchColorPicker
          name="panelCards"
          value={theme.panelCards}
          onChange={(color) => handleChangeColor('panelCards', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Hover Outline:</label>
        <SketchColorPicker
          name="panelCardHoverOutline"
          value={theme.panelCardHoverOutline}
          onChange={(color) => handleChangeColor('panelCardHoverOutline', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Panel Card Icon Color:</label>
        <SketchColorPicker
          name="panelCardIcon"
          value={theme.panelCardIcon}
          onChange={(color) => handleChangeColor('panelCardIcon', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Color:</label>
        <SketchColorPicker
          name="iconButtonColor"
          value={theme.iconButtonColor}
          onChange={(color) => handleChangeColor('iconButtonColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Background:</label>
        <SketchColorPicker
          name="iconButtonBackground"
          value={theme.iconButtonBackground}
          onChange={(color) => handleChangeColor('iconButtonBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Hover Background/Color:</label>
        <SketchColorPicker
          name="iconButtonHoverColor"
          value={theme.iconButtonHoverColor}
          onChange={(color) => handleChangeColor('iconButtonHoverColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Icon Button Selected Background:</label>
        <SketchColorPicker
          name="iconButtonSelectedBackground"
          value={theme.iconButtonSelectedBackground}
          onChange={(color) => handleChangeColor('iconButtonSelectedBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Text Color:</label>
        <SketchColorPicker
          name="buttonTextColor"
          value={theme.buttonTextColor}
          onChange={(color) => handleChangeColor('buttonTextColor', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Outlined:</label>
        <SketchColorPicker
          name="buttonOutlined"
          value={theme.buttonOutlined}
          onChange={(color) => handleChangeColor('buttonOutlined', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Filled:</label>
        <SketchColorPicker
          name="buttonFilled"
          value={theme.buttonFilled}
          onChange={(color) => handleChangeColor('buttonFilled', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Button Gradient:</label>
        <SketchColorPicker
          name="buttonGradientStart"
          value={theme.buttonGradientStart}
          onChange={(color) => handleChangeColor('buttonGradientStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="buttonGradientEnd"
          value={theme.buttonGradientEnd}
          onChange={(color) => handleChangeColor('buttonGradientEnd', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Thumb X-Axis Gradient:</label>
        <SketchColorPicker
          name="scrollbarThumbXAxisStart"
          value={theme.scrollbarThumbXAxisStart}
          onChange={(color) => handleChangeColor('scrollbarThumbXAxisStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="scrollbarThumbXAxisEnd"
          value={theme.scrollbarThumbXAxisEnd}
          onChange={(color) => handleChangeColor('scrollbarThumbXAxisEnd', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Thumb Y-Axis Gradient:</label>
        <SketchColorPicker
          name="scrollbarThumbYAxisStart"
          value={theme.scrollbarThumbYAxisStart}
          onChange={(color) => handleChangeColor('scrollbarThumbYAxisStart', color)}
        />
        <label>to</label>
        <SketchColorPicker
          name="scrollbarThumbYAxisEnd"
          value={theme.scrollbarThumbYAxisEnd}
          onChange={(color) => handleChangeColor('scrollbarThumbYAxisEnd', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Scrollbar Corner:</label>
        <SketchColorPicker
          name="scrollbarCorner"
          value={theme.scrollbarCorner}
          onChange={(color) => handleChangeColor('scrollbarCorner', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Input Outline:</label>
        <SketchColorPicker
          name="inputOutline"
          value={theme.inputOutline}
          onChange={(color) => handleChangeColor('inputOutline', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Input Background:</label>
        <SketchColorPicker
          name="inputBackground"
          value={theme.inputBackground}
          onChange={(color) => handleChangeColor('inputBackground', color)}
        />
      </Grid>
      <Divider variant="inset" component="div" className={styles.colorGridDivider} />
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Background:</label>
        <SketchColorPicker
          name="dropdownMenuBackground"
          value={theme.dropdownMenuBackground}
          onChange={(color) => handleChangeColor('dropdownMenuBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Hover Background:</label>
        <SketchColorPicker
          name="dropdownMenuHoverBackground"
          value={theme.dropdownMenuHoverBackground}
          onChange={(color) => handleChangeColor('dropdownMenuHoverBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Dropdown Menu Selected Background:</label>
        <SketchColorPicker
          name="dropdownMenuSelectedBackground"
          value={theme.dropdownMenuSelectedBackground}
          onChange={(color) => handleChangeColor('dropdownMenuSelectedBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Drawer Background:</label>
        <SketchColorPicker
          name="drawerBackground"
          value={theme.drawerBackground}
          onChange={(color) => handleChangeColor('drawerBackground', color)}
        />
      </Grid>
      <Grid item sm={12} md={6} className={styles.colorGridContainer}>
        <label>Popup Background:</label>
        <SketchColorPicker
          name="popupBackground"
          value={theme.popupBackground}
          onChange={(color) => handleChangeColor('popupBackground', color)}
        />
      </Grid>
    </Grid>
  )
}

export default ColorSelectionArea
