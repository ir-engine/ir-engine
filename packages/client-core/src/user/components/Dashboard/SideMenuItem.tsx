import React, { useEffect } from 'react'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { useTranslation } from 'react-i18next'
import {
  Accessibility,
  CalendarViewDay,
  Code,
  Dashboard as DashboardIcon,
  DirectionsRun,
  GroupAdd,
  NearMe,
  PersonAdd,
  PhotoAlbum,
  PhotoLibrary,
  Settings,
  SupervisorAccount,
  Toys,
  Casino,
  Shuffle
} from '@material-ui/icons'
import { Link, withRouter } from 'react-router-dom'
import { useStylesForDashboard } from './styles'
import ListSubheader from '@material-ui/core/ListSubheader'
import RemoveFromQueueIcon from '@material-ui/icons/RemoveFromQueue'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Collapse from '@material-ui/core/Collapse'
import { useAuthState } from '../../state/AuthService'
interface Props {
  authState?: any
  location: any
}

const SideMenuItem = (props: Props) => {
  const { location } = props
  const { pathname } = location
  const scopes = useAuthState().user?.scopes?.value || []

  let allowedRoutes = {
    routes: true,
    location: false,
    user: false,
    bot: false,
    scene: false,
    party: false,
    contentPacks: false,
    groups: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    projects: false
  }

  scopes.forEach((scope) => {
    if (Object.keys(allowedRoutes).includes(scope.type.split(':')[0])) {
      if (scope.type.split(':')[1] === 'read') {
        allowedRoutes = {
          ...allowedRoutes,
          [scope.type.split(':')[0]]: true
        }
      }
    }
  })

  const classes = useStylesForDashboard()
  const { t } = useTranslation()
  const [openSetting, setOpenSeting] = React.useState(false)
  const [openScene, setOpenScene] = React.useState(false)
  const [openUser, setOpenUser] = React.useState(false)
  const [openLocation, setOpenLocation] = React.useState(false)

  const handleSetting = () => {
    setOpenSeting(!openSetting)
    setOpenScene(false)
    setOpenUser(false)
    setOpenLocation(false)
  }
  const handleScene = () => {
    setOpenScene(!openScene)
    setOpenSeting(false)
    setOpenUser(false)
    setOpenLocation(false)
  }

  const handleUser = () => {
    setOpenUser(!openUser)
    setOpenSeting(false)
    setOpenScene(false)
    setOpenLocation(false)
  }
  const handleLocation = () => {
    setOpenLocation(!openLocation)
    setOpenSeting(false)
    setOpenScene(false)
    setOpenUser(false)
  }

  return (
    <>
      <Divider />
      <List>
        <Link to="/admin" className={classes.textLink}>
          <ListItem
            classes={{ selected: classes.selected }}
            style={{ color: 'white' }}
            selected={'/admin' === pathname}
            button
          >
            <ListItemIcon>
              <DashboardIcon style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </Link>

        {allowedRoutes.projects && (
          <Link to="/admin/projects" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              selected={'/admin/projects' === pathname}
              style={{ color: 'white' }}
              button
            >
              <ListItemIcon>
                <Code style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.projects')} />
            </ListItem>
          </Link>
        )}

        {allowedRoutes.routes && (
          <Link to="/admin/routes" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              selected={'/admin/routes' === pathname}
              style={{ color: 'white' }}
              button
            >
              <ListItemIcon>
                <Shuffle style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.routes')} />
            </ListItem>
          </Link>
        )}
        {allowedRoutes.location || allowedRoutes.instance ? (
          <ListItem style={{ color: 'white' }} button onClick={() => setOpenLocation(!openLocation)}>
            <ListItemIcon>
              <NearMe style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Location" />
            {openLocation ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        ) : (
          ''
        )}

        <Collapse in={openLocation} timeout="auto" unmountOnExit>
          {allowedRoutes.location && (
            <Link to="/admin/locations" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/locations' === pathname}
                className={classes.nested}
                style={{ color: 'white' }}
                button
              >
                <ListItemIcon>
                  <NearMe style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.locations')} />
              </ListItem>
            </Link>
          )}

          {allowedRoutes.instance && (
            <Link to="/admin/instance" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/instance' === pathname}
                className={classes.nested}
                style={{ color: 'white' }}
                button
              >
                <ListItemIcon>
                  <DirectionsRun style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.instance')} />
              </ListItem>
            </Link>
          )}
        </Collapse>

        {/* <Link to="/admin/sessions" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <DragIndicator style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.sessions')} />
          </ListItem>
        </Link> */}
        {allowedRoutes.party && (
          <Link to="/admin/parties" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              selected={'/admin/parties' === pathname}
              style={{ color: 'white' }}
              button
            >
              <ListItemIcon>
                <CalendarViewDay style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.parties')} />
            </ListItem>
          </Link>
        )}
        {/* <Link to="/admin/chats" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <Forum style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.chats')} />
          </ListItem>
        </Link> */}
        {/* {allowedRoutes.user || allowedRoutes.invite || allowedRoutes.groups ? ( */}
        <Link to="/admin/users" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button onClick={() => setOpenUser(!openUser)}>
            <ListItemIcon>
              <SupervisorAccount style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Users" />
            {openUser ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </Link>
        {/* ) : (
          ''
        )} */}

        <Collapse in={openUser} timeout="auto" unmountOnExit>
          {allowedRoutes.user && (
            <Link to="/admin/users" className={classes.textLink}>
              <ListItem
                style={{ color: 'white' }}
                className={classes.nested}
                classes={{ selected: classes.selected }}
                selected={'/admin/users' === pathname}
                button
              >
                <ListItemIcon>
                  <SupervisorAccount style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.users')} />
              </ListItem>
            </Link>
          )}
          {allowedRoutes.invite && (
            <Link to="/admin/invites" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/invites' === pathname}
                style={{ color: 'white' }}
                className={classes.nested}
                button
              >
                <ListItemIcon>
                  <PersonAdd style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.invites')} />
              </ListItem>
            </Link>
          )}
          {allowedRoutes.groups && (
            <Link to="/admin/groups" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/groups' === pathname}
                style={{ color: 'white' }}
                className={classes.nested}
                button
              >
                <ListItemIcon>
                  <GroupAdd style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.groups')} />
              </ListItem>
            </Link>
          )}
        </Collapse>

        {allowedRoutes.scene || allowedRoutes.globalAvatars || allowedRoutes.contentPacks ? (
          <ListItem style={{ color: 'white' }} button onClick={() => setOpenScene(!openScene)}>
            <ListItemIcon>
              <Casino style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Scene" />
            {openScene ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        ) : (
          ''
        )}
        <Collapse in={openScene} timeout="auto" unmountOnExit>
          <Link to="/admin/scenes" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              selected={'/admin/scenes' === pathname}
              style={{ color: 'white', background: '#15171B !important' }}
              className={classes.nested}
              button
            >
              <ListItemIcon>
                <PhotoLibrary style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.scenes')} />
            </ListItem>
          </Link>
          {allowedRoutes.globalAvatars && (
            <Link to="/admin/avatars" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/avatars' === pathname}
                className={classes.nested}
                style={{ color: 'white' }}
                button
              >
                <ListItemIcon>
                  <Accessibility style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.avatars')} />
              </ListItem>
            </Link>
          )}

          {allowedRoutes.contentPacks && (
            <Link to="/admin/content-packs" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                selected={'/admin/content-packs' === pathname}
                className={classes.nested}
                style={{ color: 'white' }}
                button
              >
                <ListItemIcon>
                  <PhotoAlbum style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.content')} />
              </ListItem>
            </Link>
          )}
        </Collapse>

        <ListItem style={{ color: 'white' }} button onClick={handleSetting}>
          <ListItemIcon>
            <Settings style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Setting" />
          {openSetting ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openSetting} timeout="auto" unmountOnExit>
          <Link to="/admin/settings" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              className={classes.nested}
              selected={'/admin/settings' === pathname}
              style={{ color: 'white' }}
              button
            >
              <ListItemIcon>
                <Settings style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={'Setting'} />
            </ListItem>
          </Link>
          {/* <Link to="/admin/bots" className={classes.textLink}>
            <ListItem
              classes={{ selected: classes.selected }}
              className={classes.nested}
              selected={'/admin/setting' === pathname}
              style={{ color: 'white' }}
              button
            >
              <ListItemIcon>
                <Settings style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={'Setting'} />
            </ListItem>
          </Link> */}
          {allowedRoutes.bot && (
            <Link to="/admin/bots" className={classes.textLink}>
              <ListItem
                classes={{ selected: classes.selected }}
                className={classes.nested}
                selected={'/admin/bots' === pathname}
                style={{ color: 'white' }}
                button
              >
                <ListItemIcon>
                  <Toys style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={t('user:dashboard.bots')} />
              </ListItem>
            </Link>
          )}
        </Collapse>
      </List>
      <Divider style={{ background: '#C0C0C0', marginTop: '2rem' }} />
      <List>
        <ListSubheader inset style={{ color: '#C0C0C0' }}>
          Social
        </ListSubheader>
        <List>
          <Link style={{ textDecoration: 'none' }} to="/admin/feeds">
            <ListItem
              style={{ color: 'white' }}
              //  onClick={changeComponent}
              classes={{ selected: classes.selected }}
              selected={'/admin/feeds' === pathname}
              button
            >
              <ListItemIcon>
                <ViewModuleIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.feeds')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/armedia">
            <ListItem
              style={{ color: 'white' }}
              //  onClick={changeComponent}
              classes={{ selected: classes.selected }}
              selected={'/admin/armedia' === pathname}
              button
            >
              <ListItemIcon>
                <EmojiPeopleIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.arMedia')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/creator">
            <ListItem
              style={{ color: 'white' }}
              // onClick={changeComponent}
              classes={{ selected: classes.selected }}
              selected={'/admin/creator' === pathname}
              button
            >
              <ListItemIcon>
                <RemoveFromQueueIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Creator" />
            </ListItem>
          </Link>
        </List>
      </List>
    </>
  )
}

export default withRouter(SideMenuItem)
