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
import { selectAppState } from "../../../../redux/app/selector";
import { selectAuthState } from "../../../../redux/auth/selector";
import styles from './ContentPack.module.scss';
import { downloadContentPack } from "../../../../redux/contentPack/service";


interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    uploadAvatar?: any;
    downloadContentPack?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    downloadContentPack: bindActionCreators(downloadContentPack, dispatch)
});


const userModel = (props: Props): any => {
    const {
        open,
        handleClose,
        downloadContentPack
    } = props;

    const [contentPackUrl, setContentPackUrl] = useState('');
    const [error, setError] = useState('');

    const showError = (err: string) => {
        setError(err);
        setTimeout(() => {
            setError('');
        }, 3000);
    }

    const getContentPack = async () => {
        try {
            console.log('Getting content pack');
            console.log(contentPackUrl);
            const res = await downloadContentPack(contentPackUrl);
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
                            onClick={getContentPack}
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