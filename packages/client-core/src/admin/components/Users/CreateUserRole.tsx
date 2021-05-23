import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { fetchUserRole, createUserRoleAction  } from "../../reducers/admin/service";
import { selectAdminState } from "../../reducers/admin/selector";


interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createUserAction?: any;
    patchUser?: any;
    fetchUserRole?: any;
    createUserRoleAction?: any;
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUserRole: bindActionCreators(fetchUserRole, dispatch),
    createUserRoleAction: bindActionCreators(createUserRoleAction, dispatch)
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
    const { open,  handleClose, createUserRoleAction } = props;
    const classes = useStyles();
    const [role, setRole] = React.useState('');


    const createUserRole = async () => {
        await createUserRoleAction({ role });
        handleClose();
        setRole("");
    };


    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create new user role </DialogTitle>
                <DialogContent>

                <TextField
                    autoFocus
                    margin="dense"
                    id="role"
                    label="User Role"
                    type="text"
                    fullWidth
                    value={role}
                    className={classes.marginBottm}
                    onChange={(e) => setRole(e.target.value)}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={createUserRole} color="primary">
                        Submit
                    </Button> 
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)( createUser);
