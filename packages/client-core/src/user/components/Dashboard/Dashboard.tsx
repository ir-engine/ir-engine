import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { useTranslation } from 'react-i18next';
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
    SupervisorAccount,
} from '@material-ui/icons';
import { Link } from "react-router-dom";
import { deepOrange } from "@material-ui/core/colors";
import Avatar from "@material-ui/core/Avatar";
import { selectAuthState } from "../../reducers/auth/selector";
import { connect } from 'react-redux';

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: "#43484F"
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: 36,
            color: "white"
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerOpen: {
            width: `${drawerWidth}px !important`,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: "#1f252d",
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: `${theme.spacing(7) + 1}px !important`,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9) + 1,
            },
            backgroundColor: "#1f252d",
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            backgroundColor: "#15171B",
            minHeight: "100vh"
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
        textLink: {
            textDecoration: "none"
        },
        orange: {
            color: theme.palette.getContrastText(deepOrange[500]),
            backgroundColor: deepOrange[500]
        },
        marginLft: {
            marginLeft: "10px"
        },
        avatarPosition: {
           display: "flex",
           marginLeft: "80%"
        }
    }),
);

interface Props {
    authState?: any
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state)
    };
};

/**
 * Function for admin dashboard 
 * 
 * @param param0 children props 
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Dashboard = ({ children, authState }) => {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
	const { t } = useTranslation();
    const admin = authState.get("user");
    const isLoggedIn = authState.get("isLoggedIn");


    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };


    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        style={{ color: "white" }}
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <Menu />
                    </IconButton>
                    <Typography variant="h6">
                        Dashboard
                    </Typography>               
                    {
                        admin["name"] &&
                        <div className={classes.avatarPosition}>
                        <Avatar className={classes.orange}>{admin["name"].charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="h6" className={classes.marginLft} >{admin["name"]}</Typography>
                        </div>
                    }
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                </div>
                <Divider />
                <List >
                    <Link to="/admin" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <DashboardIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                    </Link>
                    <Link to="/admin/users" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <SupervisorAccount style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.users')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/instance" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <DirectionsRun style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.instance')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/locations" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <NearMe style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.locations')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/invites" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <PersonAdd style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.invites')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/sessions" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <DragIndicator style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.sessions')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/groups" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <GroupAdd style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.groups')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/parties" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <CalendarViewDay style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.parties')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/chats" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <Forum style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.chats')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/content-packs" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <PhotoAlbum style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.content')} />
                        </ListItem>
                    </Link>
                    <Link to="/admin/scenes" className={classes.textLink}>
                        <ListItem style={{ color: "white" }} button>
                            <ListItemIcon >
                                <PhotoLibrary style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary={t('user:dashboard.scenes')} />
                        </ListItem>
                    </Link>
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
};


export default connect(mapStateToProps, null)(Dashboard);