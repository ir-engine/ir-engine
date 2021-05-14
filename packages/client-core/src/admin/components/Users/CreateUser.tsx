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
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Container from '@material-ui/core/Container';
import DialogTitle from '@material-ui/core/DialogTitle';
import { validationSchema } from "./validation";
import { useFormik } from "formik";




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
    adminLocations: Array<any>;
    editing: boolean;
    userEdit: any;
    patchUser?: any;
    projects: Array<any>;
    fetchUserRole?: any;
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createUserAction: bindActionCreators(createUserAction, dispatch),
    fetchUserRole: bindActionCreators(fetchUserRole, dispatch)

});

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
    };
};

const CreateUser = (props: Props) => {
    const { open, handleClose, createUserAction, adminLocations, projects, fetchUserRole, adminState } = props;
    const classes = useStyles();
    const classesx = useStyle();

    const [game, setGame] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [openCreateaUserRole, setOpenCreateUserRole] = React.useState(false);

    const userRole = adminState.get("userRole");
    const userRoleData = userRole ? userRole.get("userRole") : [];

    const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedProject = event.target.value;
        setGame(selectedProject as string);
        await fetchUserRole(selectedProject);
    };

    React.useEffect(() => {
        if (userRoleData.length > 0) {
            if (userRole.get("updateNeeded")) fetchUserRole(game);
        }
    }, [adminState]);

    const defaultProps = {
        options: adminLocations,
        getOptionLabel: (option: any) => option.name,
    };

    const createUserRole = () => {
        setOpenCreateUserRole(true);
    };

    const handleUserRoleClose = () => {
        setOpenCreateUserRole(false);
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            name: ""
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const data = {
                email: values.email,
                name: values.name,
                location,
                project_id: game,
                userRole: status,
            };
            await createUserAction(data);
            handleClose(false);
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
                        id="email"
                        label="E-mail"
                        fullWidth
                        value={formik.values.email}                
                        className={classes.marginBottm}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
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

                    <Autocomplete
                        onChange={(e, newValue) => setLocation(newValue.name as string)}
                        {...defaultProps}
                        id="debug"
                        debug
                        renderInput={(params) => <TextField {...params} label="Location" className={classes.marginBottm} />}
                    />


                    <FormControl fullWidth className={classes.marginBottm}>
                        <InputLabel id="demo-simple-select-label">Projects</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={game}
                            onChange={handleChange}
                        >
                            {
                                projects.slice(1).map(el => <MenuItem value={el.name} key={el.project_id}>{el.name}</MenuItem>)
                            }
                        </Select>
                    </FormControl>
                    {
                        game && <DialogContentText className={classes.marginBottm}>  Don't have User Role for this Project? <a href="#h" className={classes.textLink} onClick={createUserRole}>Create One</a>  </DialogContentText>
                    }
                    <FormControl fullWidth className={classes.marginBottm}>
                        <InputLabel id="demo-simple-select-label">User Role</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={status}
                            disabled={userRoleData.length > 0 ? false : true}
                            onChange={(e) => setStatus(e.target.value as string)}
                        >
                            {
                                userRoleData.map((el, index) => <MenuItem value={el.role} key={`${el.role}_${index}`}>{el.role}</MenuItem>)
                            }
                        </Select>
                    </FormControl>

                    <DialogActions>
                        <Button onClick={handleClose(false)} color="primary">
                            Cancel
                    </Button>
                        <Button type="submit" color="primary">
                            Submit
                    </Button>
                    </DialogActions>
                    </form>
                </Container>
            </Drawer>
            <CreateUserRole
                open={openCreateaUserRole}
                handleClose={handleUserRoleClose}
                projectName={game}
            />
        </React.Fragment>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
