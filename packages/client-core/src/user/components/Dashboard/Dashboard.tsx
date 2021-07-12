import React from 'react'
import clsx from 'clsx'
import { useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { useTranslation } from 'react-i18next'
import {
  CalendarViewDay,
  ChevronLeft,
  ChevronRight,
  Dashboard as DashboardIcon,
  DirectionsRun,
  DragIndicator,
  Forum,
  GroupAdd,
  Menu,
  NearMe,
  PersonAdd,
  PhotoAlbum,
  PhotoLibrary,
  Settings,
  SupervisorAccount
} from '@material-ui/icons'
import { Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar'
import { selectAuthState } from '../../reducers/auth/selector'
import { connect } from 'react-redux'
import { useStylesForDashboard } from './styles'

interface Props {
  children?: any
  authState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Dashboard = ({ children, authState }: Props) => {
  const classes = useStylesForDashboard()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation()
  const admin = authState.get('user')
  const isLoggedIn = authState.get('isLoggedIn')

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            style={{ color: 'white' }}
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6">Dashboard</Typography>
          {admin['name'] && (
            <div className={classes.avatarPosition}>
              <Avatar className={classes.orange}>{admin['name']?.charAt(0)?.toUpperCase()}</Avatar>
              <Typography variant="h6" className={classes.marginLft}>
                {admin['name']}
              </Typography>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </div>
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
          <Link to="/admin/sessions" className={classes.textLink}>
            <ListItem style={{ color: 'white' }} button>
              <ListItemIcon>
                <DragIndicator style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.sessions')} />
            </ListItem>
          </Link>
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
          <Link to="/admin/chats" className={classes.textLink}>
            <ListItem style={{ color: 'white' }} button>
              <ListItemIcon>
                <Forum style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.chats')} />
            </ListItem>
          </Link>
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
          <Link to="/admin/bots" className={classes.textLink}>
            <ListItem style={{ color: 'white' }} button>
              <ListItemIcon>
                <Settings style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('user:dashboard.bots')} />
            </ListItem>
          </Link>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div>{children}</div>
      </main>
    </div>
  )
}

export default connect(mapStateToProps, null)(Dashboard)
