import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import FormGroup from '@material-ui/core/FormGroup';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from "redux";
import { selectAppState } from '../../common/reducers/app/selector';
import { selectAuthState } from '../../user/reducers/auth/selector';
import { selectAdminState } from '../reducers/admin/selector';
import { createUser, patchUser } from '../reducers/admin/service';
// @ts-ignore
import styles from './Admin.module.scss';


interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createUser?: any;
    editing: boolean;
    userEdit: any;
    patchUser?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createUser: bindActionCreators(createUser, dispatch),
    patchUser: bindActionCreators(patchUser, dispatch),
});


const userModel = (props: Props): any => {
    const {
        open,
        handleClose,
        adminState,
        createUser,
        userEdit,
        editing,
        patchUser,
    } = props;

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState("");

    const submitUser = () => {
        const data = {
            name: name,
            avatarId: avatar
        };
        if (editing) {
            patchUser(userEdit.id, data);
        } else {
            createUser(data);
            setName("");
            setAvatar("");
        }
        handleClose();
    };

    useEffect(() => {
        if (editing) {
            setName(userEdit.name);
            setAvatar(userEdit.avatarId);
        } else {
            setName("");
            setAvatar("");
        }
    }, [userEdit, editing]);




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
                        {editing === true && <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="id"
                            label="ID"
                            name="id"
                            disabled
                            defaultValue={userEdit?.id}
                        >
                            {userEdit.id}
                        </TextField>
                        }
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="maxUsers"
                            label="Avatar"
                            name="name"
                            required
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                        />
                        <FormGroup row className={styles.locationModalButtons}>
                            {
                                editing &&
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={submitUser}
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
                                    onClick={submitUser}
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
};

export default connect(mapStateToProps, mapDispatchToProps)(userModel);