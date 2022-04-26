import React, { useState } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import SettingIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select
} from '@mui/material'

import styles from '../../../styles/settings.module.scss'

const DemoArea = () => {
  const [drawerValue, setDrawerValue] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [anchorEl, setAnchorEl] = useState<any>(null)

  const openMenu = (e) => {
    setAnchorEl(e.target)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
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
                    <MenuItem value={el} key={index} onClick={closeMenu} classes={{ root: 'option' }}>
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
                  <MenuItem value="" disabled classes={{ root: 'option' }}>
                    Select Option
                  </MenuItem>
                  {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((el, index) => (
                    <MenuItem value={el} key={index} classes={{ root: 'option' }}>
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
    </>
  )
}

export default DemoArea
