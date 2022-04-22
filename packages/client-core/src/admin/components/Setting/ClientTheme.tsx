import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import defaultThemeSettings from '@xrengine/common/src/constants/DefaultThemeSettings'

import MenuIcon from '@mui/icons-material/Menu'
import SettingIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Switch
} from '@mui/material'
import { Drawer } from '@mui/material'
import { styled } from '@mui/material/styles'

import { useAuthState } from '../../../user/services/AuthService'
import SketchColorPicker from '../../common/SketchColorPicker'
import { ClientSettingService, useClientSettingState } from '../../services/Setting/ClientSettingService'
import styles from '../../styles/settings.module.scss'

const MaterialUISwitch = styled(Switch)((props: any) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    zIndex: 2,
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff'
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: props.theme.themeSwitchTrack
      }
    }
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: props.theme.themeSwitchThumb,
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff'
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
    }
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: props.theme.themeSwitchTrack,
    borderRadius: 20 / 2
  }
}))

const ClientTheme = () => {
  const selfUser = useAuthState().user
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id

  const { t } = useTranslation()

  const [drawerValue, setDrawerValue] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [mode, setMode] = useState(selfUser?.user_setting?.value?.themeMode || 'dark')
  const [themeSetting, setThemeSetting] = useState(clientSetting?.themeSettings || defaultThemeSettings)

  const handleChangeColor = (name, value) => {
    const tempSetting = JSON.parse(JSON.stringify(themeSetting))

    tempSetting[mode][name] = value

    setThemeSetting(tempSetting)
  }

  const handleChangeThemeMode = (event) => {
    setMode(event.target.checked ? 'dark' : 'light')
  }

  const openMenu = (e) => {
    setAnchorEl(e.target)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    ClientSettingService.patchClientSetting(
      {
        logo: clientSetting?.logo,
        title: clientSetting?.title,
        icon192px: clientSetting?.icon192px,
        icon512px: clientSetting?.icon512px,
        favicon16px: clientSetting?.favicon16px,
        favicon32px: clientSetting?.favicon32px,
        siteDescription: clientSetting?.siteDescription,
        appTitle: clientSetting?.appTitle,
        appSubtitle: clientSetting?.appSubtitle,
        appDescription: clientSetting?.appDescription,
        appBackground: clientSetting?.appBackground,
        appSocialLinks: JSON.stringify(clientSetting?.appSocialLinks),
        themeSettings: JSON.stringify(themeSetting)
      },
      id
    )
  }

  const handleCancel = () => {
    setThemeSetting(clientSetting?.themeSettings)
  }

  const theme = themeSetting[mode]

  return (
    <div>
      <style>
        {`
        .themeDemoArea {
          width: 100%;
          height: 500px;
          color: ${theme.textColor};
          background: white;      
          box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
        }

        .navbar {
          width: 100%;
          height: 50px;
          padding: 10px;
          position: sticky;
          background-color: ${theme.navbarBackground};
          box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
        }

        .logoSection {
          color: ${theme.textColor};
        }

        .mainSection {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: calc(100% - 50px);
        }

        .hiddenWidth {
          width: 120%;
          height: 0px;
          visibility: hidden;
        }

        .contentArea {
          flex: 1;
          overflow: auto;
          background: ${theme.mainBackground};
        }

        .contentArea::-webkit-scrollbar-thumb {
          background: linear-gradient(${theme.scrollbarThumbYAxisStart}, ${theme.scrollbarThumbYAxisEnd});
        }
        
        .contentArea::-webkit-scrollbar-thumb:horizontal {
          background: linear-gradient(92.22deg, ${theme.scrollbarThumbXAxisStart}, ${theme.scrollbarThumbXAxisEnd});
        }
        
        .contentArea::-webkit-scrollbar-corner {
          background-color: ${theme.scrollbarCorner};
        }

        .sidebar {
          width: 100px;
          height: 100%;
          background: ${theme.sidebarBackground};
        }

        .sidebarSelectedItem {
          background-color: ${theme.sidebarSelectedBackground} !important;
        }

        .panel {
          display: flex;
          margin: 20px;
          padding: 20px;
          flex-direction: column;
          border-radius: 8px;
          background: ${theme.panelBackground};
        }

        .textHeading {
          font-size: 16px;
          color: ${theme.textHeading};
          margin-bottom: 10px;
        }

        .textSubheading {
          font-size: 14px;
          color: ${theme.textSubheading};
          margin: 5px 0px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .textDescription {
          font-size: 12px;
          color: ${theme.textDescription};
        }

        .panelCardContainer {
          display: grid;
          grid-gap: 10px;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .panelCard {
          width: 100%;
          padding: 10px;
          border-radius: 4px;
          background: ${theme.panelCards};
        }

        .panelCardImage {
          width: 100%;
          height: 125px;
          background-size: cover;
          background-image: url(/static/xrengine_thumbnail.jpg);
        }

        .panelCard:hover {
          border: solid 1px ${theme.panelCardHoverOutline};
        }

        .panelCardIcon {
          width: 24px;
          height: 24px;
          padding: 0;
          color: ${theme.panelCardIcon};
        }

        .iconButtonContainer {
          display: flex;
          flex-direction: column;
        }

        .iconButtonContainer label {
          margin: 5px 0px;
        }

        .buttonContainer {
          display: flex;
          flex-direction: column;
        }

        .buttonContainer label {
          margin: 5px 0px;
        }

        .iconButton {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          color: ${theme.iconButtonColor};
          background: ${theme.iconButtonBackground};
        }

        .iconButtonSelected {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          color: ${theme.iconButtonColor};
          background: ${theme.iconButtonSelectedBackground};
        }

        .iconButtonSelected:hover {
          opacity: 0.8;
          background: ${theme.iconButtonHoverColor};
        }

        .iconButton:hover {
          opacity: 0.8;
          background: ${theme.iconButtonHoverColor};
        }

        .outlinedButton {
          margin: 0px;
          color: ${theme.buttonOutlined};
          background: transparent;
          border: solid 1px ${theme.buttonOutlined};
        }

        .outlinedButton:hover {
          opacity: 0.8;
        }

        .filledButton {
          margin: 0px;
          color: ${theme.buttonTextColor};
          background: ${theme.buttonFilled};
        }

        .filledButton:hover {
          opacity: 0.8;
        }

        .gradientButton {
          margin: 0px;
          color: ${theme.buttonTextColor};
          background: linear-gradient(92.22deg, ${theme.buttonGradientStart}, ${theme.buttonGradientEnd});
        }

        .gradientButton:hover {
          opacity: 0.8;
        }

        .input {
          border-radius: 4px;
          color: ${theme.textColor};
          background: ${theme.inputBackground};
          border: solid 1px ${theme.inputOutline};
        }

        .input input {
          padding: 4px 5px 5px;
        }

        .select {
          height: 2.4rem !important;
          color: ${theme.textColor} !important;
          background: ${theme.inputBackground};
          border: solid 1px ${theme.inputOutline};
        }

        .select svg {
          color: ${theme.textColor}
        }
        
        .selectPaper {
          background-color: ${theme.dropdownMenuBackground};
          color: ${theme.textColor};
        }

        .drawer {
          background-color: ${theme.drawerBackground};
        }
        `}
      </style>
      <label>Demo Area:</label>
      <br />
      <br />
      <Box className="themeDemoArea">
        <nav className="navbar">
          <div className="logoSection">XR-Engine</div>
        </nav>
        <div className="mainSection">
          <div className="sidebar">
            <List className="sidebarList">
              {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'].map((item, index) => (
                <ListItem
                  key={index}
                  className={index === 1 ? 'sidebarSelectedItem' : ''}
                  selected={index === 1}
                  button
                >
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </div>
          <div className="contentArea">
            <div className="hiddenWidth"></div>
            <Box className="panel">
              <div className="textHeading">Heading</div>
              <Box className="panelCardContainer">
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon">
                      <SettingIcon />
                    </IconButton>
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon">
                      <SettingIcon />
                    </IconButton>
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon">
                      <SettingIcon />
                    </IconButton>
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon">
                      <SettingIcon />
                    </IconButton>
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
              </Box>
            </Box>
            <Box className="panel">
              <div className="textHeading">Buttons</div>
              <div className="buttonContainer">
                <div className="iconButtonContainer">
                  <label className="textSubheading">Unselected Button:</label>
                  <IconButton className="iconButton">
                    <SettingIcon />
                  </IconButton>
                  <label className="textSubheading">Selected Button:</label>
                  <IconButton className="iconButtonSelected">
                    <SettingIcon />
                  </IconButton>
                </div>
                <label className="textSubheading">Filled Button:</label>
                <Button variant="outlined" className="outlinedButton">
                  Cancel
                </Button>
                <label className="textSubheading">Outlined Button:</label>
                <Button variant="contained" className="filledButton">
                  Submit
                </Button>
                <label className="textSubheading">Gradient Button:</label>
                <Button variant="contained" className="gradientButton">
                  Save
                </Button>
              </div>
              <Divider variant="inset" component="div" className={styles.colorGridDivider} />
              <div className="textHeading">Dropdown</div>
              <div className="buttonContainer">
                <label className="textSubheading">Menu Icon Dropdown:</label>
                <IconButton className="iconButton" onClick={openMenu}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={closeMenu}
                  classes={{ paper: 'selectPaper' }}
                >
                  {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((el, index) => (
                    <MenuItem value={el} key={index} onClick={closeMenu}>
                      {el}
                    </MenuItem>
                  ))}
                </Menu>
                <label className="textSubheading">Select Dropdown:</label>
                <Select
                  displayEmpty
                  value={selectValue}
                  className="select"
                  MenuProps={{ classes: { paper: 'selectPaper' } }}
                  onChange={(e) => setSelectValue(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select Option
                  </MenuItem>
                  {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((el, index) => (
                    <MenuItem value={el} key={index}>
                      {el}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <Divider variant="inset" component="div" className={styles.colorGridDivider} />
              <div className="textHeading">Input</div>
              <InputBase className="input" placeholder="this is the input placeholder" />
              <Divider variant="inset" component="div" className={styles.colorGridDivider} />
              <div className="textHeading">Drawer</div>
              <Button variant="contained" className="filledButton" onClick={() => setDrawerValue(true)}>
                Open Drawer
              </Button>
              <Drawer
                open={drawerValue}
                anchor="right"
                classes={{ paper: 'drawer' }}
                onClose={() => setDrawerValue(false)}
              ></Drawer>
            </Box>
          </div>
        </div>
      </Box>
      <Grid container>
        <Grid item sm={12} md={12} marginTop="25px" marginBottom="15px">
          <FormControlLabel
            control={<MaterialUISwitch sx={{ m: 1 }} theme={theme} checked={mode === 'dark'} />}
            label={<label>Theme Mode:</label>}
            labelPlacement="start"
            sx={{ margin: '0px' }}
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
        <Grid item sm={12} md={12} className={styles.colorGridContainer}>
          <label>Navbar Background:</label>
          <SketchColorPicker
            name="navbarBackground"
            value={theme.navbarBackground}
            onChange={(color) => handleChangeColor('navbarBackground', color)}
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
        <Grid item sm={12} md={12} className={styles.colorGridContainer}>
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
          <label>Drawer Background:</label>
          <SketchColorPicker
            name="drawerBackground"
            value={theme.drawerBackground}
            onChange={(color) => handleChangeColor('drawerBackground', color)}
          />
        </Grid>
      </Grid>
      <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
        {t('admin:components.setting.cancel')}
      </Button>
      <Button
        sx={{ maxWidth: '100%' }}
        variant="contained"
        className={styles.saveBtn}
        type="submit"
        onClick={handleSubmit}
      >
        {t('admin:components.setting.save')}
      </Button>
    </div>
  )
}

export default ClientTheme
