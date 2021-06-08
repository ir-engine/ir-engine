import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
// @ts-ignore
import styles from '../Admin.module.scss';
import Button from '@material-ui/core/Button';
import UserModel from "./CreateUser";
import UserTable from "./UserTable";
import SearchUser from "./SearchUser";
import {
   TabPanelProps
} from "./Variables";


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

const Users = () => {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [userModalOpen, setUserModalOpen] = React.useState(false);


    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const openModalCreate = (open: boolean) =>
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
        };

    const closeViewModel = (open: boolean) => {
        setUserModalOpen(open);
    };


    return (
        <div>
            <Grid container spacing={3} className={classes.marginBottom}>
                <Grid item xs={9}>
                    <SearchUser />
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
                    <Tab label="USERS" {...a11yProps(0)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <UserTable />
                </TabPanel>
            </div>

            <UserModel
                open={userModalOpen}
                handleClose={openModalCreate}
                closeViewModel={closeViewModel}
            />
        </div>
    );
};

export default Users;
