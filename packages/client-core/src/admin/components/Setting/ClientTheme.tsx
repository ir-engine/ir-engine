import React, { useState } from 'react'

import SketchColorPicker from '@xrengine/client-core/src/admin/common/SketchColorPicker'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

import SettingIcon from '@mui/icons-material/Settings'
import { Box, Divider, FormControlLabel, Grid, IconButton, List, ListItem, ListItemText, Switch } from '@mui/material'
import { styled } from '@mui/material/styles'

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

  const [mode, setMode] = useState(selfUser?.user_setting?.value?.themeMode || 'dark')
  const [themeSetting, setThemeSetting] = useState({
    light: {
      textColor: '#FFF',
      navbarBackground: 'rgb(73 66 152 / 85%)',
      sidebarBackground: '#6760b0',
      sidebarSelectedBackground: 'rgb(73 66 152 / 100%)',
      mainBackground: '#c2b7f6',
      panelBackground: '#7f78c4',
      panelCards: '#9a9ae4',
      panelCardHoverOutline: '#9898ff',
      panelCardIcon: '#6760b0',
      textHeading: '#FFF',
      textSubheading: '#FFF',
      textDescription: '#FFF',
      iconButtonColor: '',
      iconButtonBackground: '',
      iconButtonSelected: '',
      buttonOutlined: '',
      buttonFilled: '',
      buttonGradientStart: '',
      buttonGradientEnd: '',
      scrollbarThumbXAxisStart: '',
      scrollbarThumbXAxisEnd: '',
      scrollbarThumbYAxisStart: '',
      scrollbarThumbYAxisEnd: '',
      scrollbarCorner: '',
      inputOutline: '',
      inputBackground: '',
      dropdownMenuBackground: '',
      dropdownMenuSelectedBackground: '',
      themeSwitchTrack: '#aab4be',
      themeSwitchThumb: '#c2b7f6'
    },
    dark: {
      textColor: '#FFF',
      navbarBackground: 'rgb(31 27 72 / 85%)',
      sidebarBackground: 'rgb(31 27 72 / 100%)',
      sidebarSelectedBackground: '#5f5ff1',
      mainBackground: '#02022d',
      panelBackground: '#1f1b48',
      panelCards: '#3c3c6f',
      panelCardHoverOutline: '#9898ff',
      panelCardIcon: '#1f1b48',
      textHeading: '#FFF',
      textSubheading: '#FFF',
      textDescription: '#FFF',
      iconButtonColor: '',
      iconButtonBackground: '',
      iconButtonSelectedBackground: '',
      buttonOutlined: '',
      buttonFilled: '',
      buttonGradientStart: '',
      buttonGradientEnd: '',
      scrollbarThumbXAxisStart: '',
      scrollbarThumbXAxisEnd: '',
      scrollbarThumbYAxisStart: '',
      scrollbarThumbYAxisEnd: '',
      scrollbarCorner: '',
      inputOutline: '',
      inputBackground: '',
      dropdownMenuBackground: '',
      dropdownMenuSelectedBackground: '',
      themeSwitchTrack: '#8796a5',
      themeSwitchThumb: '#02022d'
    }
  })

  const handleChangeColor = (name, value) => {
    const tempSetting = JSON.parse(JSON.stringify(themeSetting))

    tempSetting[mode][name] = value

    setThemeSetting(tempSetting)
  }

  const handleChangeThemeMode = (event) => {
    setMode(event.target.checked ? 'dark' : 'light')
  }

  const theme = themeSetting[mode]

  return (
    <div>
      <style>
        {`
        .themeDemoArea {
          width: 100%;
          height: 400px;
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

        .mainSection::-webkit-scrollbar-thumb {
          background: ${theme.scrollbarThumbYAxis};
        }
        
        .mainSection::-webkit-scrollbar-thumb:horizontal {
          background: ${theme.scrollbarThumbXAxis};
        }
        
        .mainSection::-webkit-scrollbar-corner {
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

        .contentArea {
          flex: 1;
          overflow: auto;
          background: ${theme.mainBackground};
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
        <Grid item sm={12} md={12} className={styles.colorGridContainer}>
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
          <label>Dropdown Selected Background:</label>
          <SketchColorPicker
            name="dropdownMenuSelectedBackground"
            value={theme.dropdownMenuSelectedBackground}
            onChange={(color) => handleChangeColor('dropdownMenuSelectedBackground', color)}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default ClientTheme
