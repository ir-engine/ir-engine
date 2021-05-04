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
import { fetchUsersAsAdmin, fetchAdminLocations } from "../../reducers/admin/service";

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

interface Props {
    adminState?: any;
    fetchUsersAsAdmin?: any;
    authState?: any;
    fetchAdminLocations?: any
}

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch)
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
    const { adminState, fetchUsersAsAdmin, authState, fetchAdminLocations } = props;
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

    const user = authState.get("user");
    const adminUsers = adminState.get("users").get("users");
    const adminLocations = adminState.get('locations').get('locations');

    React.useEffect(()=> {
        const fetchData = async () => {
            await fetchUsersAsAdmin();
        };
        if((adminState.get('users').get('updateNeeded') === true) && user.id) fetchData();

        if( user?.id && (adminState.get("locations").get("updateNeeded") === true )) fetchAdminLocations();
    }, [adminState, user, fetchUsersAsAdmin]);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const openModalCreate = () => {
        setUserModalOpen(true);
        setUserEditing(false);
    };

    const handleUserClose = () => {
        setUserModalOpen(false);
        setUserEditing(false);
    };

    console.log('====================================');
    console.log(adminLocations);
    console.log('====================================');
    console.log('====================================');
    console.log(adminUsers);
    console.log('====================================');
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
                        onClick={openModalCreate}
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
                        [
                            {
                                label: "All users"
                            },
                            {
                                label: "Golf Game",
                            },
                            {
                                label: "Football"
                            },
                            {
                                label: "Club Night"
                            }
                        ].map((el, index) => <Tab label={el.label} {...a11yProps(index)} />)
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
                handleClose={handleUserClose}
                editing={userEditing}
                userEdit={userEdit}
                adminLocations={adminLocations}
            />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);
