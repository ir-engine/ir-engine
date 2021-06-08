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
import { 
    createInstance, 
    fetchAdminInstances,
    patchInstance 
    } from '../../reducers/admin/instance/service';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { fetchAdminLocations } from "../../reducers/admin/location/service";
import { useFormik } from "formik";
import { instanceValidationSchema } from "./validation";
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';
import { useStyles } from "./styles";
import { Props } from "./variables";
import { selectAdminLocationState } from "../../reducers/admin/location/selector";


const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminLocationState: selectAdminLocationState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createInstance: bindActionCreators(createInstance, dispatch),
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
    patchInstance: bindActionCreators(patchInstance, dispatch),
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
});



/**
 * Function for create instance on admin dashboard 
 * 
 * @param param0 children props 
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const CreateInstance = (props: Props) => {
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
        adminLocationState
    } = props;
    const [ipAddress, setIpAddress] = useState('');
    const [curremtUser, setCurrentUser] = useState("");
    const [location, setLocation] = useState("");


    const user = authState.get('user');
    const adminLocation = adminLocationState.get('locations');
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
    }, [authState, adminLocationState]);

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

    const formik = useFormik({
        initialValues: {
            currentUsers: "",
            ipAddress: ""
        },
        validationSchema: instanceValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            const data = {
                ipAddress: values.ipAddress,
                currentUsers: values.currentUsers,
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
            resetForm();
        }
    });
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
                        <Typography variant="h5" gutterBottom={true} className={classes.marginTop}>
                            Create new instance
                        </Typography>
                        <form onSubmit={formik.handleSubmit}>
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
                                value={formik.values.ipAddress}
                                onChange={formik.handleChange}
                                error={formik.touched.ipAddress && Boolean(formik.errors.ipAddress)}
                                helperText={formik.touched.ipAddress && formik.errors.ipAddress}
                            />
                            <TextField
                                variant="outlined"
                                className={classes.marginBottm}
                                margin="normal"
                                fullWidth
                                id="maxUsers"
                                label="current users"
                                name="currentUsers"
                                value={formik.values.currentUsers}
                                onChange={formik.handleChange}
                                error={formik.touched.currentUsers && Boolean(formik.errors.currentUsers)}
                                helperText={formik.touched.currentUsers && formik.errors.currentUsers}
                            />

                            <Autocomplete
                                onChange={(e, newValue) => setLocation(newValue.id as string)}
                                {...defaultProps}
                                id="debug"
                                debug
                                renderInput={(params) => <TextField {...params} label="Locations" className={classes.marginBottm} />}
                            />

                            <DialogContentText className={classes.marginBottm}>  Don't see location? <a href="/admin/locations" className={classes.textLink}>Create new one</a>  </DialogContentText>

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
                        </form>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(CreateInstance);