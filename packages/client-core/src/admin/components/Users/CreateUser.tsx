import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createUser as createUserAction } from "../../reducers/admin/service";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { fetchUserRole } from "../../reducers/admin/service";
import { selectAdminState } from "../../reducers/admin/selector";
import DialogContentText from '@material-ui/core/DialogContentText';
import CreateUserRole from "./CreateUserRole";
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import DialogTitle from '@material-ui/core/DialogTitle';
import { validationSchema } from "./validation";
import { useFormik } from "formik";
import { selectAuthState } from "../../../user/reducers/auth/selector";
import { fetchAdminInstances } from '../../reducers/admin/service';
import { fetchAdminParty } from "../../reducers/admin/service";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marginBottm: {
            marginBottom: "15px"
        },
        textLink: {
            marginLeft: "5px",
            textDecoration: "none",
            color: "#ff9966"
        },
        marginTp: {
            marginTop: "20%"
        },
        texAlign: {
            textAlign: "center"
        }
    })
);

const useStyle = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    paper: {
        width: "40%"
    }
});

interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createUserAction?: any;
    authState?: any;
    editing: boolean;
    userEdit: any;
    patchUser?: any;
    fetchUserRole?: any;
    fetchAdminInstances?: any;
    fetchAdminParty?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createUserAction: bindActionCreators(createUserAction, dispatch),
    fetchUserRole: bindActionCreators(fetchUserRole, dispatch),
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
    fetchAdminParty: bindActionCreators(fetchAdminParty, dispatch)
});

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
    };
};

const CreateUser = (props: Props) => {
    const { open, handleClose, createUserAction, authState, fetchAdminInstances, fetchUserRole, fetchAdminParty, adminState } = props;
    const classes = useStyles();
    const classesx = useStyle();
    const [status, setStatus] = React.useState('');
    const [openCreateaUserRole, setOpenCreateUserRole] = React.useState(false);
    const [instance, setInstance] = React.useState("");
    const [party, setParty] = React.useState("");

    const user = authState.get("user");
    const userRole = adminState.get("userRole");
    const userRoleData = userRole ? userRole.get("userRole") : [];
    const adminInstances = adminState.get('instances');
    const instanceData = adminInstances.get("instances");
    const adminParty = adminState.get("parties");
    const adminPartyData = adminParty.get("parties").data ? adminParty.get("parties").data : [];

    React.useEffect(() => {
        const fetchData = async () => {
            await fetchUserRole();
        };
        if ((adminState.get('users').get('updateNeeded') === true) && user.id) fetchData();

        if (user.id && adminInstances.get("updateNeeded")) {
            fetchAdminInstances();
        }

        if (user.id && adminParty.get('updateNeeded') == true) {
            fetchAdminParty();
        }
    }, [adminState, user]);

    const defaultProps = {
        options: userRoleData,
        getOptionLabel: (option: any) => option.role,
    };

    const data = [];
    instanceData.forEach(element => {
        data.push(element);
    });

    const InstanceProps = {
        options: data,
        getOptionLabel: (option: any) => option.ipAddress
    };

    const partyData = adminPartyData.map(el => ({ ...el, label: `Location: ${el.location.name || ""}  ____  Instance: ${el.instance.ipAddress || ""}` }));
    const PartyProps = {
        options: partyData,
        getOptionLabel: (option: any) => option.label
    };

    const createUserRole = () => {
        setOpenCreateUserRole(true);
    };

    const handleUserRoleClose = () => {
        setOpenCreateUserRole(false);
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            avatar: "",
            inviteCode: ""
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const data = {
                name: values.name,
                avatarId: values.avatar,
                inviteCode: values.inviteCode,
                instanceId: instance,
                userRole: status,
                partyId: party
            };
            await createUserAction(data);
            handleClose(false);
            setInstance("");
            setStatus("");
            setParty("");
            resetForm();
        }
    });

    return (
        <React.Fragment >
            <Drawer
                classes={{ paper: classesx.paper }}
                anchor="right"
                open={open}
                onClose={handleClose(false)}
            >
                <Container maxWidth="sm" className={classes.marginTp}>
                    <DialogTitle id="form-dialog-title" className={classes.texAlign} >Create New User</DialogTitle>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            fullWidth
                            value={formik.values.name}
                            className={classes.marginBottm}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />

                        <TextField
                            autoFocus
                            margin="dense"
                            id="inviteCode"
                            label="Invite code"
                            type="text"
                            fullWidth
                            value={formik.values.inviteCode}
                            className={classes.marginBottm}
                            onChange={formik.handleChange}
                            error={formik.touched.inviteCode && Boolean(formik.errors.inviteCode)}
                            helperText={formik.touched.inviteCode && formik.errors.inviteCode}
                        />

                        <TextField
                            autoFocus
                            margin="dense"
                            id="avatar"
                            label="Avatar"
                            type="text"
                            fullWidth
                            value={formik.values.avatar}
                            className={classes.marginBottm}
                            onChange={formik.handleChange}
                            error={formik.touched.avatar && Boolean(formik.errors.avatar)}
                            helperText={formik.touched.avatar && formik.errors.avatar}
                        />

                        <Autocomplete
                            onChange={(e, newValue) => setStatus(newValue.role as string)}
                            {...defaultProps}
                            id="debug"
                            debug
                            renderInput={(params) => <TextField {...params} label="User Role" className={classes.marginBottm} />}
                        />

                        <DialogContentText className={classes.marginBottm}>  Don't see user role? <a href="#h" className={classes.textLink} onClick={createUserRole}>Create One</a>  </DialogContentText>

                        <Autocomplete
                            onChange={(e, newValue) => setInstance(newValue.id as string)}
                            {...InstanceProps}
                            id="debug"
                            debug
                            renderInput={(params) => <TextField {...params} label="Instance" className={classes.marginBottm} />}
                        />

                        <DialogContentText className={classes.marginBottm}>  Don't see Instance? <a href="/admin/instance" className={classes.textLink}>Create One</a>  </DialogContentText>

                        <Autocomplete
                            onChange={(e, newValue) => setParty(newValue.id as string)}
                            {...PartyProps}
                            id="debug"
                            debug
                            renderInput={(params) => <TextField {...params} label="Party" className={classes.marginBottm} />}
                        />

                        <DialogContentText className={classes.marginBottm}>  Don't see Party? <a href="/admin/parties" className={classes.textLink}>Create One</a>  </DialogContentText>

                        <DialogActions>
                            <Button type="submit" color="primary">
                                Submit
                            </Button>
                            <Button onClick={handleClose(false)} color="primary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </form>
                </Container>
            </Drawer>
            <CreateUserRole
                open={openCreateaUserRole}
                handleClose={handleUserRoleClose}
            />
        </React.Fragment>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
