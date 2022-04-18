import React, { useState } from 'react'

import SketchColorPicker from '@xrengine/client-core/src/admin/common/SketchColorPicker'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

import { Box, FormControlLabel, Grid, List, ListItem, ListItemText, Switch } from '@mui/material'
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
      panelBackground: '',
      panelCards: '',
      panelCardIcon: '',
      textHeading: '',
      textSubheading: '',
      textDescription: '',
      iconButton: '',
      iconButtonSelected: '',
      buttonOutlined: '',
      buttonFilled: '',
      buttonGradientStart: '',
      buttonGradientEnd: '',
      scrollbarThumbXAxis: '',
      scrollbarThumbYAxis: '',
      scrollbarCorner: '',
      inputOutlineColor: '',
      inputBackgroundColor: '',
      dropdownMenuBackground: '',
      dropdownMenuHoverBackground: '',
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
      panelBackground: '',
      panelCards: '',
      panelCardIcon: '',
      textHeading: '',
      textSubheading: '',
      textDescription: '',
      iconButton: '',
      iconButtonSelected: '',
      buttonOutlined: '',
      buttonFilled: '',
      buttonGradientStart: '',
      buttonGradientEnd: '',
      scrollbarThumbXAxis: '',
      scrollbarThumbYAxis: '',
      scrollbarCorner: '',
      inputOutlineColor: '',
      inputBackgroundColor: '',
      dropdownMenuBackground: '',
      dropdownMenuHoverBackground: '',
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
          <div className="contentArea"></div>
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
        <Grid item sm={12} md={6} className={styles.colorGridContainer}>
          <label>Navbar Background:</label>
          <SketchColorPicker
            name="navbarBackground"
            value={theme.navbarBackground}
            onChange={(color) => handleChangeColor('navbarBackground', color)}
          />
        </Grid>
        <Grid item sm={12} md={6} className={styles.colorGridContainer}>
          <label>Main Background:</label>
          <SketchColorPicker
            name="mainBackground"
            value={theme.mainBackground}
            onChange={(color) => handleChangeColor('mainBackground', color)}
          />
        </Grid>
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
        <Grid item sm={12} md={6} className={styles.colorGridContainer}>
          <label>Text Color:</label>
          <SketchColorPicker
            name="textColor"
            value={theme.textColor}
            onChange={(color) => handleChangeColor('textColor', color)}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default ClientTheme
