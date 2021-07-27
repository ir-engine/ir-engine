import React from 'react'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { useTranslation } from 'react-i18next'
import {
  Accessibility,
  CalendarViewDay,
  Dashboard as DashboardIcon,
  DirectionsRun,
  DragIndicator,
  Forum,
  GroupAdd,
  NearMe,
  PersonAdd,
  PhotoAlbum,
  PhotoLibrary,
  Settings,
  SupervisorAccount
} from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { useStylesForDashboard } from './styles'
import ListSubheader from '@material-ui/core/ListSubheader'
import RemoveFromQueueIcon from '@material-ui/icons/RemoveFromQueue'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople'
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream'
import GradientIcon from '@material-ui/icons/Gradient'
import SuperviosorAccount from '@material-ui/icons/SupervisorAccount'

const SideMenuItem = () => {
  const classes = useStylesForDashboard()
  const { t } = useTranslation()
  return (
    <>
      <Divider />
      <List>
        <Link to="/admin" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <DashboardIcon style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </Link>
        <Link to="/admin/users" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <SupervisorAccount style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.users')} />
          </ListItem>
        </Link>
        <Link to="/admin/instance" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <DirectionsRun style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.instance')} />
          </ListItem>
        </Link>
        <Link to="/admin/locations" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <NearMe style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.locations')} />
          </ListItem>
        </Link>
        <Link to="/admin/invites" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <PersonAdd style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.invites')} />
          </ListItem>
        </Link>
        {/* <Link to="/admin/sessions" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <DragIndicator style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.sessions')} />
          </ListItem>
        </Link> */}
        <Link to="/admin/groups" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <GroupAdd style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.groups')} />
          </ListItem>
        </Link>
        <Link to="/admin/parties" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <CalendarViewDay style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.parties')} />
          </ListItem>
        </Link>
        {/* <Link to="/admin/chats" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <Forum style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.chats')} />
          </ListItem>
        </Link> */}
        <Link to="/admin/content-packs" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <PhotoAlbum style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.content')} />
          </ListItem>
        </Link>
        <Link to="/admin/scenes" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <PhotoLibrary style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.scenes')} />
          </ListItem>
        </Link>
        <Link to="/admin/avatars" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <Accessibility style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.avatars')} />
          </ListItem>
        </Link>
        <Link to="/admin/bots" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <Settings style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.bots')} />
          </ListItem>
        </Link>
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
              button
            >
              <ListItemIcon>
                <EmojiPeopleIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.arMedia')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/tips-and-tricks">
            <ListItem
              style={{ color: 'white' }}
              //   onClick={changeComponent}
              button
            >
              <ListItemIcon>
                <SettingsSystemDaydreamIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Tips&Tricks" />
            </ListItem>
          </Link>

          <Link style={{ textDecoration: 'none' }} to="/admin/thefeeds">
            <ListItem
              style={{ color: 'white' }}
              // onClick={changeComponent}
              button
            >
              <ListItemIcon>
                <RemoveFromQueueIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Feeds" />
            </ListItem>
          </Link>
        </List>
      </List>
    </>
  )
}

export default SideMenuItem
