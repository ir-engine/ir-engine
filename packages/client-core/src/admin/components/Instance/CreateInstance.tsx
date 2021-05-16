import React, { useState, useEffect } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import FormGroup from '@material-ui/core/FormGroup';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from "redux";
// @ts-ignore
import styles from '../Admin.module.scss';
import classNames from 'classnames';
import { selectAppState } from '../../../common/reducers/app/selector';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { selectAdminState } from '../../reducers/admin/selector';
import { createInstance, fetchAdminInstances, patchInstance } from '../../reducers/admin/service';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { fetchAdminLocations } from "../../reducers/admin/service";


const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createInstance: bindActionCreators(createInstance, dispatch),
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
    patchInstance: bindActionCreators(patchInstance, dispatch),
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
});

interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createInstance?: any;
    fetchAdminInstances?: any;
    editing: any;
    instanceEdit: any;
    patchInstance?: any;
    fetchAdminLocations?: any;
    authState?: any;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marginBottm: {
            marginBottom: "15px"
        }
    })
);

/**
 * Function for create instance on admin dashboard 
 * 
 * @param param0 children props 
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

function CreateInstance(props: Props) {
    const classes = useStyles();

    const {
        open,
        handleClose,
        createInstance,
        fetchAdminInstances,
        editing,
        instanceEdit,
        patchInstance,
        authState,
        fetchAdminLocations,
        adminState
    } = props;
    const [ipAddress, setIpAddress] = useState('');
    const [curremtUser, setCurrentUser] = useState("");
    const [location, setLocation] = useState("");


    const user = authState.get('user');
    const adminLocation = adminState.get('locations');
    const locationData = adminLocation.get("locations");
    useEffect(() => {
        if (editing) {
            setIpAddress(instanceEdit.ipAddress);
            setCurrentUser(instanceEdit.currentUsers);
        } else {
            setIpAddress("");
            setCurrentUser("");
        }
    }, [instanceEdit, editing]);

    useEffect(() => {
        if (user?.id != null && adminLocation.get('updateNeeded') === true) {
            fetchAdminLocations();
        }
    }, [authState, adminState]);

    const submitInstance = () => {
        const data = {
            ipAddress: ipAddress,
            currentUsers: curremtUser,
            locationId: location
        };
        if (editing) {
            patchInstance(instanceEdit.id, data);
        } else {
            createInstance(data);
            setIpAddress("");
            setCurrentUser("");
        }

        fetchAdminInstances();
        handleClose();
    };

    const defaultProps = {
        options: locationData,
        getOptionLabel: (option: any) => option.name,
    };

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={styles.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500
                }}
            >
                <Fade in={props.open}>
                    <div className={classNames({
                        [styles.paper]: true,
                        [styles['modal-content']]: true
                    })}>
                        {editing && <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="id"
                            label="ID"
                            name="id"
                            disabled
                            defaultValue={instanceEdit?.id}
                        >
                            {instanceEdit.id}
                        </TextField>
                        }
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="ipAddress"
                            label="Ip Address"
                            name="ipAddress"
                            required
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="maxUsers"
                            label="curremtUser"
                            name="curremtUser"
                            required
                            value={curremtUser}
                            onChange={(e) => setCurrentUser(e.target.value)}
                        />

                        <Autocomplete
                            onChange={(e, newValue) => setLocation(newValue.id as string)}
                            {...defaultProps}
                            id="debug"
                            debug
                            renderInput={(params) => <TextField {...params} label="Locations" className={classes.marginBottm} />}
                        />

                        <FormGroup row className={styles.locationModalButtons}>
                            {
                                editing &&
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={submitInstance}
                                >
                                    Update
                                </Button>
                            }
                            {
                                !editing &&
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={submitInstance}
                                >
                                    Create
                                </Button>
                            }
                            <Button
                                type="submit"
                                variant="contained"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </FormGroup>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateInstance);