import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Search from "../Search";
import Grid from "@material-ui/core/Grid";
// @ts-ignore
import styles from '../Admin.module.scss';
import Button from '@material-ui/core/Button';
import UserModel from "./CreateUser";
import UserTable from "./UserTable";
import { connect } from "react-redux";
import { selectAdminState } from "../../reducers/admin/selector";
import { selectAuthState } from "../../../user/reducers/auth/selector";
import { bindActionCreators, Dispatch } from "redux";
import { fetchUsersAsAdmin, fetchUsersForProject, fetchAdminLocations, fetchUserRole  } from "../../reducers/admin/service";
import { withApi } from "../../../world/components/editor/contexts/ApiContext";
import Api from "../../../world/components/editor/Api";
import { selectAppState } from '../../../common/reducers/app/selector';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

interface Props {
    adminState?: any;
    fetchUsersAsAdmin?: any;
    authState?: any;
    fetchAdminLocations?: any;
    api?: Api;
    fetchUsersForProject?: any
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
    fetchUsersForProject: bindActionCreators(fetchUsersForProject, dispatch)
});

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const a11yProps = (index: any) => {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
};

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        width: "100%",
        backgroundColor: theme.palette.background.paper
    },
    marginBottom: {
        marginBottom: "10px"
    }
}));

const Users = (props: Props) => {
    const { api, adminState, fetchUsersAsAdmin, authState, fetchAdminLocations, fetchUsersForProject } = props;
    const classes = useStyles();
    const initialUser = {
        id: null,
        name: '',
        avatarId: ''
    };
    const [value, setValue] = React.useState(0);
    const [userEditing, setUserEditing] = React.useState(false);
    const [userModalOpen, setUserModalOpen] = React.useState(false);
    const [userEdit, setUserEdit] = React.useState(initialUser);
    const [projects, setProjects] = React.useState([{ name: "All Users", project_id: "001"}]);

    const user = authState.get("user");
    const adminUsers = adminState.get("users").get("users");
    const adminLocations = adminState.get('locations').get('locations');
    const authUser = authState.get("authUser");


    React.useEffect(()=> {
        const fetchData = async () => {
            await fetchUsersAsAdmin();
        };
        if((adminState.get('users').get('updateNeeded') === true) && user.id) fetchData();

        if( user?.id && (adminState.get("locations").get("updateNeeded") === true )) fetchAdminLocations();
    }, [adminState, user, fetchUsersAsAdmin]);

    React.useEffect(()=> {
        if(authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null) {
           api.getProjects()
              .then(project => {
                 setProjects([...projects ,...project]);
              })
              .catch(error => {
                  console.error(error);                 
              });
        }
    }, [authUser, user]);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const openModalCreate = ( open: boolean) =>
    (
        event: React.KeyboardEvent | React.MouseEvent,
      ) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }
        setUserModalOpen(open);
        setUserEditing(false);
      };

    return (
        <div>
            <Grid container spacing={3} className={classes.marginBottom}>
                <Grid item xs={9}>
                    <Search typeName="users" />
                </Grid>
                <Grid item xs={3}>
                    <Button
                        className={styles.createLocation}
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={openModalCreate(true)}
                    >
                        Create New User
                    </Button>
                </Grid>
            </Grid>
            <div className={classes.root}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    {
                       projects.map(el => <Tab  label={el.name} {...a11yProps(el.project_id)} />)
                    }
                </Tabs>
                <TabPanel value={value} index={0}>
                    {
                        adminUsers.size > 0 &&
                        <UserTable adminUsers={adminUsers}/>
                    }
                </TabPanel>
                <TabPanel value={value} index={1}>
                    FootBall
            </TabPanel>
                <TabPanel value={value} index={2}>
                    Club Night
            </TabPanel>
            </div>

            <UserModel
                open={userModalOpen}
                handleClose={openModalCreate}
                editing={userEditing}
                userEdit={userEdit}
                adminLocations={adminLocations}
                projects={projects}
            />
        </div>
    );
};

export default withApi(connect(mapStateToProps, mapDispatchToProps)(Users));
