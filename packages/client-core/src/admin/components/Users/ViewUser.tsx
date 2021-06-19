import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Chip from '@material-ui/core/Chip';
import { Edit, Save } from "@material-ui/icons";
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
import { fetchUserRole } from "../../reducers/admin/user/service";
import { connect } from 'react-redux';
import {
    fetchAdminParty,
    updateUserRole,
    patchUser,
    fetchSingleUserAdmin,
} from "../../reducers/admin/service";
import { useFormik } from 'formik';
import { useStyles, useStyle } from "./styles";
import { userValidationSchema } from "./validation";
import { selectAdminUserState } from '../../reducers/admin/user/selector';


interface Props {
    open: boolean;
    handleClose: any;
    userAdmin: any;
    adminState?: any;
    authState?: any;
    fetchUserRole?: any;
    fetchAdminParty?: any;
    patchUser?: any;
    closeViewModel?: any;
    updateUserRole?: any;
    fetchSingleUserAdmin?: any;
    adminUserState?: any
}

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
        adminUserState: selectAdminUserState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUserRole: bindActionCreators(fetchUserRole, dispatch),
    fetchAdminParty: bindActionCreators(fetchAdminParty, dispatch),
    patchUser: bindActionCreators(patchUser, dispatch),
    updateUserRole: bindActionCreators(updateUserRole, dispatch),
    fetchSingleUserAdmin: bindActionCreators(fetchSingleUserAdmin, dispatch)
});

const ViewUser = (props: Props) => {
    const classx = useStyle();
    const classes = useStyles();
    const {
        open,
        handleClose,
        closeViewModel,
        fetchUserRole,
        adminState,
        authState,
        userAdmin,
        fetchAdminParty,
        patchUser,
        updateUserRole,
        fetchSingleUserAdmin,
        adminUserState
    } = props;
    const [openDialog, setOpenDialog] = React.useState(false);
    const [status, setStatus] = React.useState("");
    const [editMode, setEditMode] = React.useState(false);
    const [party, setParty] = React.useState(userAdmin?.party);
    const [instance, setInstance] = React.useState(userAdmin?.party?.instance);
    const [initialValue, setInitialValue] = React.useState({
        name: "",
        avatar: "",
        inviteCode: "",
    });
    const [refetch, setRefetch] = React.useState(false);

    const user = authState.get("user");
    const userRole = adminUserState.get("userRole");
    const userRoleData = userRole ? userRole.get("userRole") : [];
    const adminParty = adminState.get("parties");
    const adminPartyData = adminParty.get("parties").data ? adminParty.get("parties").data : [];
    const adminInstances = adminState.get('instances');
    const instanceData = adminInstances.get("instances");
    const singleUser = adminUserState.get("singleUser");
    const singleUserData = adminUserState.get("singleUser").get("singleUser");

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
        if ((adminUserState.get('users').get('updateNeeded') === true) && user.id) fetchData();

        if (user.id && adminParty.get('updateNeeded') == true) {
            fetchAdminParty();
        }
        if ((user.id && singleUser.get('updateNeeded') == true) || refetch) {
            fetchSingleUserAdmin(userAdmin.id);
            setRefetch(false);
        }
    }, [adminUserState, user, refetch]);

    React.useEffect(() => {
        if (!refetch) {
            setRefetch(true);
        }
    }, [userAdmin.id]);


    React.useEffect(() => {
        if (singleUserData) {
            setInitialValue({
                name: singleUserData.name,
                avatar: singleUserData.avatarId,
                inviteCode: singleUserData.inviteCode
            });
        }
    }, [singleUserData]);

    const defaultProps = {
        options: userRoleData,
        getOptionLabel: (option: any) => option.role,
    };

    const partyData = adminPartyData.map(el => ({ ...el, label: el.location.name }));
    const PartyProps = {
        options: partyData,
        getOptionLabel: (option: any) => option.label
    };

    const data = [];
    instanceData.forEach(element => {
        data.push(element);
    });

    const InstanceProps = {
        options: data,
        getOptionLabel: (option: any) => option.ipAddress
    };


    const patchUserRole = async (user: any, role: string) => {
        await updateUserRole(user, role);
        handleCloseDialog();
    };

    const formik = useFormik({
        initialValues: initialValue,
        validationSchema: userValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            const data = {
                name: values.name,
                avatarId: values.avatar,
                inviteCode: values.inviteCode,
                instanceId: instance.id,
                partyId: party.id
            };
            patchUser(userAdmin.id, data);
            resetForm({ values: { name: "", avatar: "", inviteCode: "" } });
            setEditMode(false);
            closeViewModel(false);
            setInitialValue({
                name: "",
                avatar: "",
                inviteCode: ""
            });
        }
    });

    return (
        <React.Fragment>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose(false)}
                classes={{ paper: classx.paper }}
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit(e);
                }}>
                    {userAdmin &&
                        <Paper elevation={3} className={classes.paperHeight} >
                            <Container maxWidth="sm">
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Avatar className={classes.large}>{
                                            !userAdmin.avatarId ? <Skeleton animation="wave" variant="circle" width={40} height={40} /> : userAdmin.avatarId.charAt(0).toUpperCase()
                                        }
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <div className={classes.mt20}>
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

                            <Dialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                aria-labelledby="form-dialog-title"
                                classes={{ paper: classx.paperDialog }}
                            >
                                <DialogTitle id="form-dialog-title">Do you really want to change role for {userAdmin.name}? </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        In order to change role for {userAdmin.name} search from the list or select user role and submit.
                                    </DialogContentText>
                                    <Autocomplete
                                        onChange={(e, newValue) => {
                                            if (newValue) {
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
                    <Container maxWidth="sm">
                        {
                            editMode ?
                                <div className={classes.mt10}>
                                    <Typography variant="h4" component="h4" className={classes.mb10}> Update personal Information  </Typography>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        value={formik.values.name || initialValue.name}
                                        className={classes.mb20px}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                        helperText={formik.touched.name && formik.errors.name}
                                    />
                                    <Autocomplete
                                        className={classes.mb20px}
                                        onChange={(e, newValue) => {
                                            if (newValue) {
                                                setParty(newValue as string);
                                            } else {
                                                setParty("");
                                            }
                                        }}
                                        defaultValue={{ label: party?.location.name || "" }}
                                        {...PartyProps}
                                        id="debug"
                                        debug
                                        renderInput={(params) => <TextField {...params} label="Location" defaultValue={party?.location?.name || ""} />}
                                    />
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="avatar"
                                        label="Avatar"
                                        type="text"
                                        fullWidth
                                        value={formik.values.avatar || initialValue.avatar}
                                        className={classes.mb20px}
                                        onChange={formik.handleChange}
                                        error={formik.touched.avatar && Boolean(formik.errors.avatar)}
                                        helperText={formik.touched.avatar && formik.errors.avatar}
                                    />
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="inviteCode"
                                        label="Invite code"
                                        type="text"
                                        fullWidth
                                        value={formik.values.inviteCode || initialValue.inviteCode}
                                        className={classes.mb20px}
                                        onChange={formik.handleChange}
                                        error={formik.touched.inviteCode && Boolean(formik.errors.inviteCode)}
                                        helperText={formik.touched.inviteCode && formik.errors.inviteCode}
                                    />
                                    <Autocomplete
                                        className={classes.mb10}
                                        onChange={(e, newValue) => {
                                            if (newValue) {
                                                setInstance(newValue as string);
                                            } else {
                                                setInstance("");
                                            }
                                        }}
                                        {...InstanceProps}
                                        defaultValue={{ label: instance.ipAddress || "" }}
                                        id="debug"
                                        debug
                                        renderInput={(params) => <TextField {...params} label="Instance" defaultValue={instance.ipAddress || ""} />}
                                    />
                                </div>
                                :
                                <Grid container spacing={3} className={classes.mt10}>
                                    <Typography variant="h4" component="h4" className={classes.mb20px}>Personal Information  </Typography>
                                    <Grid item xs={6}>
                                        <Typography variant="h5" component="h5" className={classes.mb10}>Location:</Typography>
                                        <Typography variant="h5" component="h5" className={classes.mb10}>Avatar:</Typography>
                                        <Typography variant="h5" component="h5" className={classes.mb10}>Invite Code:</Typography>
                                        <Typography variant="h5" component="h5" className={classes.mb10}>Instance:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h6" component="h6" className={classes.mb10} >{userAdmin?.party?.location?.name || <span className={classx.spanNone}>None</span>}</Typography>
                                        <Typography variant="h6" component="h6" className={classes.mb10}>{userAdmin?.avatarId || <span className={classx.spanNone}>None</span>}</Typography>
                                        <Typography variant="h6" component="h6" className={classes.mb10}>{userAdmin?.inviteCode || <span className={classx.spanNone}>None</span>}</Typography>
                                        <Typography variant="h6" component="h6" className={classes.mb10}>{userAdmin?.party?.instance?.ipAddress || <span className={classx.spanNone}>None</span>}</Typography>
                                    </Grid>
                                </Grid>
                        }

                        <DialogActions className={classes.mb10}>
                            {
                                editMode ?
                                    <div>
                                        <Button
                                            type="submit"
                                            className={classx.saveBtn}
                                        >
                                            <span style={{ marginRight: "15px" }}><Save /></span> Submit
                                        </Button>
                                        <Button
                                            className={classx.saveBtn}
                                            onClick={() => {
                                                setInitialValue({
                                                    name: "",
                                                    avatar: "",
                                                    inviteCode: ""
                                                });
                                                setEditMode(false);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    :
                                    <div>
                                        <Button
                                            className={classx.saveBtn}
                                            onClick={() => {
                                                setEditMode(true);
                                            }}>
                                            EDIT
                                        </Button>
                                        <Button
                                            onClick={handleClose(false)}
                                            className={classx.saveBtn}
                                        >
                                            CANCEL
                                        </Button>
                                    </div>
                            }
                        </DialogActions>
                    </Container>
                </form>
            </Drawer>
        </React.Fragment>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewUser);