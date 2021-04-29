import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createUser as createUserAction }  from "../../reducers/admin/service";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { fetchUserRole  } from "../../reducers/admin/service";
import { selectAdminState } from "../../reducers/admin/selector";
import DialogContentText from '@material-ui/core/DialogContentText';
import CreateUserRole from "./CreateUserRole";

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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marginBottm: {
            marginBottom: "15px"
        },
        textLink: {
            marginLeft: "5px",
            textDecoration: "none",
            color: "#ff9966"
        }
    })
);
const createUser = (props: Props) => {
    const { open, handleClose, createUserAction, adminLocations, projects, fetchUserRole, adminState } = props;
    const classes = useStyles();
    const [game, setGame] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [location, setLocation] = React.useState('');
    
    const userRole = adminState.get("userRole");
    const userRoleData = userRole ? userRole.get("userRole") : [];
    console.log('====================================');
    console.log(userRoleData);
    console.log('====================================');

    const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedProject = event.target.value; 
        setGame( selectedProject as string);
        await fetchUserRole(selectedProject);
    };

    const defaultProps = {
        options: adminLocations,
        getOptionLabel: (option: any ) => option.name,
    };

    // React.useEffect(()=>{
    //     const fetchUserRoleData = async () => {
    //         await fetchUserRole();
    //     }
    //     fetchUserRoleData();
    // }, []);


    const submitData = async () => {
        const data = {
            email,
            name,
            location,
            game,
            status
        };
        await createUserAction(data);
        handleClose();
    };

    const createUserRole = () => {
        
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="E-mail"
                        type="email"
                        fullWidth
                        value={email}
                        className={classes.marginBottm}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={name}
                        className={classes.marginBottm}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Autocomplete
                        onChange={(e, newValue)=>  setLocation(newValue.name as string)}
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
                                projects.slice(1).map(el=> <MenuItem value={el.project_id} key={el.project_id}>{el.name}</MenuItem> )
                            }
                        </Select>
                    </FormControl>
                    {
                         ( game && userRoleData.length === 0 ) &&  <DialogContentText  className={classes.marginBottm}>  Don't have User Role for this Project? <a href="#h" className={classes.textLink} onClick={createUserRole}>Create One</a> <CreateUserRole />  </DialogContentText>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={submitData} color="primary">
                        Submit
                    </Button> 
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)( createUser);
