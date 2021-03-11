import React, { useState } from 'react';
import {
    Backdrop,
    Button,
    Fade,
    FormGroup,
    Modal,
    TextField
} from '@material-ui/core';
import { connect } from 'react-redux';
import {
    createInstance,
    fetchAdminInstances
} from "../../../redux/admin/service";
import { bindActionCreators, Dispatch } from "redux";
import { selectAppState } from "../../../redux/app/selector";
import { selectAuthState } from "../../../redux/auth/selector";
import { selectAdminState } from "../../../redux/admin/selector";
import styles from './Admin.module.scss';
import classNames from 'classnames';

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
     createInstance: bindActionCreators(createInstance, dispatch),
     fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
});

interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createInstance?: any;
    fetchAdminInstances?: any;
}


function CreateInstance(props: Props) {
    const {
        open,
        handleClose,
        createInstance,
        fetchAdminInstances
    } = props;
    const [ipAddress, setIpAddress] = useState('');
    const [curremtUser, setCurrentUser] = useState("");

    const submitInstance = () => {
        const data = {
            ipAddress: ipAddress,
            currentUsers: curremtUser
        }
        createInstance(data);
        fetchAdminInstances();
        handleClose();
    }

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
                        <FormGroup row className={styles.locationModalButtons}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                onClick={submitInstance}
                            >
                                Create
                            </Button>
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
    )
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateInstance);