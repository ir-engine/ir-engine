import classNames from 'classnames';
import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import styles from './AlertModals.module.scss';
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Modal from "@material-ui/core/Modal";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

interface Props {
    open: boolean;
    title: string;
    body: string;
    handleClose: any;
    action: any;
    parameters: any[];
    timeout: number;
    closeEffect?: any;
    noCountdown?: boolean;
}

const mapStateToProps = (state: any): any => {
    return {
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});


const WarningRetryModal = (props: Props): any => {
    const {
        open,
        title,
        body,
        noCountdown,
        action,
        parameters,
        timeout,
        handleClose,
        closeEffect
    } = props;

    const [countdown, setCountdown] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    const handleCloseButtonClick = () => {
        handleClose();
        if (closeEffect != null) closeEffect();
    };

    useEffect(() => {
        if (open === true && noCountdown !== true) {
            setTimeRemaining(timeout / 1000);
        } else {
            clearInterval(countdown as any);
        }
    }, [open]);

    useEffect(() => {
        if (timeRemaining === 0) {
            action(...parameters);
            handleClose();
        }

        if (timeRemaining !== 0) {
            setCountdown(setInterval(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000));
        }

        return () => clearInterval(countdown as any);
    }, [timeRemaining]);

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
                onBackdropClick={() => {
                    if (closeEffect != null) closeEffect();
                }}
            >
                <Fade in={props.open}>
                    <div className={classNames({
                        [styles.paper]: true,
                        [styles['modal-content']]: true
                    })}>
                        <div className={styles['modal-header']}>
                            <div/>
                            <div className={styles['title']}>{title}</div>
                            <IconButton
                                aria-label="close"
                                className={styles.closeButton}
                                onClick={handleCloseButtonClick}
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <div className={styles['modal-body']}>
                            {body}
                            { noCountdown !== true && <div>
                                { timeRemaining } seconds
                            </div>}
                            { noCountdown !== true && <div className={styles.footer}>Closing this modal will cancel the countdown</div> }
                        </div>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(WarningRetryModal);