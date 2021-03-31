import {
    Backdrop,
    Button,
    Fade,
    FormGroup,
    Modal,
    TextField
} from '@material-ui/core';
import classNames from 'classnames';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from "redux";
import { selectAdminState } from "../../../../redux/admin/selector";
import {
    createUser,
    patchUser
} from "../../../../redux/admin/service";
import { selectAppState } from "../../../../redux/app/selector";
import { selectAuthState } from "../../../../redux/auth/selector";
import styles from './ContentPack.module.scss';
import { uploadAvatars } from "../../../../redux/contentPack/service";


interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    uploadAvatar?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    uploadAvatars: bindActionCreators(uploadAvatars, dispatch)
});


const userModel = (props: Props): any => {
    const {
        open,
        handleClose,
        uploadAvatars
    } = props;

    const [contentPackUrl, setContentPackUrl] = useState('');
    const [error, setError] = useState('');

    const showError = (err: string) => {
        setError(err);
        setTimeout(() => {
            setError('');
        }, 3000);
    }

    const downloadContentPack = async () => {
        try {
            const res = await axios.get(contentPackUrl);
            console.log(res);
            if (!(res && res.data && (res.data.avatars || res.data.scenes))) {
                showError('Not a valid manifest file');
            }
            const { avatars, scenes } = res.data;
            avatars.each(avatar => {

            });
            await uploadAvatars(avatars);
            // setContentPackUrl('');
            // handleClose();
        } catch(err) {
            showError('Invalid URL');
        }
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
                        <div>Download Content Pack from URL</div>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="contentPackUrl"
                            label="Content Pack URL"
                            placeholder="https://example.com/content-pack/example/manifest.json"
                            name="name"
                            required
                            value={contentPackUrl}
                            onChange={(e) => setContentPackUrl(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            onClick={downloadContentPack}
                        >
                            Download Content Pack
                        </Button>
                        { error && error.length > 0 && <h2>{error}</h2> }
                    </div>
                </Fade>
            </Modal>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(userModel);