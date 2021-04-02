import React, { useEffect, useState } from "react";
import { sendInvite, retrieveSentInvites, retrieveReceivedInvites } from "../../../../redux/invite/service";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { bindActionCreators, Dispatch } from "redux";
import { withRouter, Router } from "next/router";
import { connect } from "react-redux";
import {
    Box,
    Button
} from '@material-ui/core';
import UploadModal from "./UploadModal";
import {
    fetchUsersAsAdmin,
} from '../../../../redux/admin/service';
import { selectAuthState } from '../../../../redux/auth/selector';
import { selectAdminState } from "../../../../redux/admin/selector";
import { ConfirmProvider } from "material-ui-confirm";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';


interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

interface Props {
    router: Router,
    adminState?: any,
    authState?: any
}

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch),
    retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch),
    retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch),
});

const ContentPacksConsole = (props: Props) => {
    const classes = useStyles();
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const openUploadModal = () => {
        setUploadModalOpen(true);
    };
    const closeUploadModal = () => {
        setUploadModalOpen(false);
    };

    return (
        <div>
            <ConfirmProvider>
               <Button
                   variant="contained"
                   color="primary"
                   onClick={openUploadModal}
               >
                   Upload content pack
               </Button>
            </ConfirmProvider>
            <UploadModal
                className="cool-pants"
                open={uploadModalOpen}
                handleClose={closeUploadModal}
            />
        </div>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContentPacksConsole));