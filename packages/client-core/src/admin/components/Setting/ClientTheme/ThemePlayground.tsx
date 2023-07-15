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

import { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Dialog from '@etherealengine/ui/src/primitives/mui/Dialog'
import Divider from '@etherealengine/ui/src/primitives/mui/Divider'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import InputBase from '@etherealengine/ui/src/primitives/mui/InputBase'
import List from '@etherealengine/ui/src/primitives/mui/List'
import ListItem from '@etherealengine/ui/src/primitives/mui/ListItem'
import ListItemText from '@etherealengine/ui/src/primitives/mui/ListItemText'
import Menu from '@etherealengine/ui/src/primitives/mui/Menu'
import MenuItem from '@etherealengine/ui/src/primitives/mui/MenuItem'
import Select from '@etherealengine/ui/src/primitives/mui/Select'
import Table from '@etherealengine/ui/src/primitives/mui/Table'
import TableBody from '@etherealengine/ui/src/primitives/mui/TableBody'
import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'
import TableContainer from '@etherealengine/ui/src/primitives/mui/TableContainer'
import TableHead from '@etherealengine/ui/src/primitives/mui/TableHead'
import TablePagination from '@etherealengine/ui/src/primitives/mui/TablePagination'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import DrawerView from '../../../common/DrawerView'
import styles from '../../../styles/settings.module.scss'

/*
  Don't replace basic components from ThemePlayground with custom made or any library components
  since basic components are here styled according to the temporary selected theme for playground,
  not the main theme used everywhere in app.
*/

const ThemePlayground = () => {
  const dock = useHookstate(false)
  const dialog = useHookstate(false)
  const drawerValue = useHookstate(false)
  const selectValue = useHookstate('')
  const anchorEl = useHookstate<any>(null)

  const { t } = useTranslation()

  const openMenu = (e) => {
    anchorEl.set(e.target)
  }

  const closeMenu = () => {
    anchorEl.set(null)
  }

  const columns = [
    { id: 'name', label: 'Name', minWidth: 65, align: 'left' },
    {
      id: 'isGuest',
      label: 'Status',
      minWidth: 65,
      align: 'right'
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 65,
      align: 'right'
    },
    {
      id: 'inviteCode',
      label: 'Invite code',
      minWidth: 65,
      align: 'right'
    },
    {
      id: 'instanceId',
      label: 'Instance',
      minWidth: 65,
      align: 'right'
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 65,
      align: 'right'
    }
  ]

  const rows = [
    {
      name: 'Josh',
      isGuest: false,
      location: 'test',
      inviteCode: 'NULL',
      instanceId: 'koqwndpkqwndpkqwndpqkwndm',
      action: (
        <>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanWhite">View</span>
          </a>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanDange">Delete</span>
          </a>
        </>
      )
    },
    {
      name: 'Liam',
      isGuest: false,
      location: 'apartment',
      inviteCode: 'NULL',
      instanceId: 'alksdnvoakewndawepdnpqwdew',
      action: (
        <>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanWhite">View</span>
          </a>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanDange">Delete</span>
          </a>
        </>
      )
    },
    {
      name: 'Gheric',
      isGuest: false,
      location: 'test',
      inviteCode: 'NULL',
      instanceId: 'qkpwejdpqwdmpqlcmnpqwmndqow',
      action: (
        <>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanWhite">View</span>
          </a>
          <a className="actionStyle" onClick={() => {}}>
            <span className="spanDange">Delete</span>
          </a>
        </>
      )
    }
  ]

  const selectMenu: InputMenuItem[] = ['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((el) => {
    return {
      value: el,
      label: el
    }
  })

  return (
    <>
      <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.themePlayground')}</Typography>
      <Box className="themeDemoArea">
        <nav className="navbar">
          <div className="logoSection">Ethereal Engine</div>
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
            <Box className="tableBox">
              <TableContainer className="tableContainer">
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          align="right"
                          padding="normal"
                          className="tableCellHeader"
                          style={{ minWidth: headCell.minWidth }}
                        >
                          {headCell.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={`${index}${row.name}`}>
                          {columns.map((column, index) => {
                            const value = row[column.id]
                            return (
                              <TableCell key={index} align="right" className="tableCellBody">
                                {value}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[12]}
                component="div"
                count={rows.length}
                rowsPerPage={100}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                className="tableFooter"
              />
            </Box>
            <Box className="panel">
              <div className="textHeading">Heading</div>
              <Box className="panelCardContainer">
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon" icon={<Icon type="Settings" />} />
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon" icon={<Icon type="Settings" />} />
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon" icon={<Icon type="Settings" />} />
                  </div>
                  <div className="textDescription">This is my description</div>
                </Box>
                <Box className="panelCard">
                  <img className="panelCardImage" />
                  <div className="textSubheading">
                    <label className="text">Subheading</label>
                    <IconButton className="panelCardIcon" icon={<Icon type="Settings" />} />
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
                  <IconButton className="iconButton" icon={<Icon type="Settings" />} />
                  <label className="textSubheading">Selected Button:</label>
                  <IconButton className="iconButtonSelected" icon={<Icon type="Settings" />} />
                </div>
                <label className="textSubheading">Outlined Button:</label>
                <Button variant="outlined" className="outlinedButton">
                  Cancel
                </Button>
                <label className="textSubheading">Filled Button:</label>
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
                <IconButton className="iconButton" onClick={openMenu} icon={<Icon type="Menu" />} />
                <Menu
                  anchorEl={anchorEl.value}
                  open={Boolean(anchorEl.value)}
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
                  value={selectValue.value}
                  className="select"
                  MenuProps={{ classes: { paper: 'selectPaper' } }}
                  onChange={(e: any) => selectValue.set(e.target.value)}
                >
                  <MenuItem value="" key={-1} disabled classes={{ root: 'option', selected: 'optionSelected' }}>
                    Select Option
                  </MenuItem>
                  {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((el, index) => (
                    <MenuItem value={el} key={index} classes={{ root: 'option', selected: 'optionSelected' }}>
                      {el}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <Divider variant="inset" component="div" className={styles.colorGridDivider} />
              <div className="textHeading">Input</div>
              <InputBase className="input" placeholder={t('admin:components.setting.placeholderText')} />
              <Divider variant="inset" component="div" className={styles.colorGridDivider} />
              <div className="textHeading">Drawer</div>
              <Button variant="contained" className="filledButton" onClick={() => drawerValue.set(true)}>
                Open Drawer
              </Button>
              <DrawerView
                open={drawerValue.value}
                classes={{ paper: 'drawer' }}
                onClose={() => drawerValue.set(false)}
              ></DrawerView>
              <div className="textHeading">Popup</div>
              <Button variant="contained" className="filledButton" onClick={() => dialog.set(true)}>
                Open Popup
              </Button>
              <Dialog
                open={dialog.value}
                className="popupMainBackground"
                PaperProps={{ className: 'drawerPaper' }}
                onClose={() => dialog.set(false)}
              ></Dialog>
              <div className="textHeading">Editor Dock</div>
              <Button variant="contained" className="filledButton" onClick={() => dock.set(true)}>
                Open Dock
              </Button>
              <div
                className="dockClickAway"
                style={{ display: dock.value ? 'block' : 'none' }}
                onClick={() => dock.set(false)}
              ></div>
              <div className="dockBackground" style={{ display: dock.value ? 'block' : 'none' }}></div>
            </Box>
          </div>
        </div>
      </Box>
    </>
  )
}

export default ThemePlayground
