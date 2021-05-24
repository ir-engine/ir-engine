import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Chip from '@material-ui/core/Chip';
import { Edit } from "@material-ui/icons";
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { selectAdminState } from "../../reducers/admin/selector";
import { selectAuthState } from "../../../user/reducers/auth/selector";
import { bindActionCreators, Dispatch } from 'redux';
import { fetchUserRole } from "../../reducers/admin/service";
import { connect } from 'react-redux';
import { client } from "../../../feathers";


interface Props {
    open: boolean;
    handleClose: any;
    userAdmin: any;
    adminState?: any;
    authState?: any;
    fetchUserRole?: any
}

const useStyle = makeStyles({
    paper: {
        width: "50%"
    }
});

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        large: {
            width: theme.spacing(14),
            height: theme.spacing(14),
            marginTop: "20%"
        },
        paperHeight: {
            height: "20vh"
        },
        titleH4: {
            marginTop: "20%"
        }
    })
);

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUserRole: bindActionCreators(fetchUserRole, dispatch),
});

const ViewUser = (props: Props) => {
    const classx = useStyle();
    const classes = useStyles();
    const { open, handleClose, fetchUserRole, adminState, authState, userAdmin } = props;
    const [openDialog, setOpenDialog] = React.useState(false);
    const [status, setStatus] = React.useState("");

    const user = authState.get("user");
    const userRole = adminState.get("userRole");
    const userRoleData = userRole ? userRole.get("userRole") : [];
    const handleClick = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    React.useEffect(() => {
        const fetchData = async () => {
            await fetchUserRole();
        };
        if ((adminState.get('users').get('updateNeeded') === true) && user.id) fetchData();

    }, [adminState, user]);

    const defaultProps = {
        options: userRoleData,
        getOptionLabel: (option: any) => option.role,
    };

    const patchUserRole = async (user: any, role: string) => {
        await client.service('user').patch(user, {
            userRole: role
        });
        handleCloseDialog();
    };

    return (
        <React.Fragment>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose(false)}
                classes={{ paper: classx.paper }}
            >
                {userAdmin &&
                    <Paper elevation={3} className={classes.paperHeight} >
                        <Container maxWidth="sm">
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Avatar className={classes.large}>{
                                        !userAdmin.avatarId ? <Skeleton animation="wave" variant="circle" width={40} height={40} /> : userAdmin.avatarId.charAt(0)
                                    }
                                    </Avatar>
                                </Grid>
                                <Grid item xs={8}>
                                    <div className={classes.titleH4}>
                                        <Typography variant="h4" component="span">{userAdmin.name}</Typography><br />
                                        {
                                            userAdmin.userRole ?
                                            <Chip
                                                label={userAdmin.userRole}
                                                onDelete={handleClick}
                                                deleteIcon={<Edit />}
                                            />
                                            :
                                            <Chip
                                            label="None"
                                            onDelete={handleClick}
                                            deleteIcon={<Edit />}
                                        />
                                        }
                                    </div>
                                </Grid>
                            </Grid>
                        </Container>
                        <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                            <DialogTitle id="form-dialog-title">Do you really want to change role for {userAdmin.name}? </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    In order to change role for {userAdmin.name} search from the list or select user role and submit.
                                </DialogContentText>
                                <Autocomplete
                                    onChange={(e, newValue) => {
                                        if(newValue){
                                            setStatus(newValue.role as string);
                                        } else {
                                            setStatus("");
                                        }
                                    }}
                                    {...defaultProps}
                                    id="debug"
                                    debug
                                    renderInput={(params) => <TextField {...params} label="User Role" />}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    patchUserRole(userAdmin.id, status);
                                }} color="primary">
                                    Submit
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                }
            </Drawer>
        </React.Fragment>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewUser);