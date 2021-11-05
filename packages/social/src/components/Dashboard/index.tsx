import React, { useEffect } from 'react'
import clsx from 'clsx'
import { useTheme, Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RemoveFromQueueIcon from '@mui/icons-material/RemoveFromQueue'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'
import GradientIcon from '@mui/icons-material/Gradient'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SuperviosorAccount from '@mui/icons-material/SupervisorAccount'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { Link } from 'react-router-dom'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslation } from 'react-i18next'

const drawerWidth = 200

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      backgroundColor: '#43484F'
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    menuButton: {
      marginRight: 36,
      color: 'white'
    },
    hide: {
      display: 'none'
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap'
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }),
      backgroundColor: '#1f252d'
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1
      },
      backgroundColor: '#1f252d'
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      backgroundColor: '#15171B',
      minHeight: '100vh'
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff'
    }
  })
)

export default function Dashboard({ children }) {
  const classes = useStyles()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const { t } = useTranslation()

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const changeComponent = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
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
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">{t('social:dashboard.title')}</Typography>
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
          <IconButton onClick={handleDrawerClose} size="large">
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link style={{ textDecoration: 'none' }} to="/admin">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <DashboardIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.dashboard')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/users">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <SuperviosorAccount style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.users')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/feeds">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <ViewModuleIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.feeds')} />
            </ListItem>
          </Link>
          <Link style={{ textDecoration: 'none' }} to="/admin/armedia">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <EmojiPeopleIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.arMedia')} />
            </ListItem>
          </Link>

          <Link style={{ textDecoration: 'none' }} to="/admin/thefeeds">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <RemoveFromQueueIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Feeds" />
            </ListItem>
          </Link>

          <Link style={{ textDecoration: 'none' }} to="/editor/new">
            <ListItem style={{ color: 'white' }} onClick={changeComponent} button>
              <ListItemIcon>
                <GradientIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={t('social:dashboard.editor')} />
            </ListItem>
          </Link>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div>{children}</div>
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </main>
    </div>
  )
}
