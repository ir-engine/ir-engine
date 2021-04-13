import React, { useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { bindActionCreators, Dispatch } from "redux";
import { withRouter, Router } from "next/router";
import { connect } from "react-redux";
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    ListSubheader
} from '@material-ui/core';
import DownloadModal from "./DownloadModal";
import { selectAuthState } from "../../../user/reducers/auth/selector";
import { selectAdminState } from '../../reducers/admin/selector';
import { selectContentPackState } from "../../reducers/contentPack/selector";
import { ConfirmProvider } from "material-ui-confirm";
import {
    fetchContentPacks
} from "../../reducers/contentPack/service";
import ContentPackDetailsModal from './ContentPackDetailsModal';
// @ts-ignore
import styles from './ContentPack.module.scss';

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
    contentPackState?: any
    fetchContentPacks?: any
}

const mapStateToProps = (state: any): any => {
    return {
        adminState: selectAdminState(state),
        authState: selectAuthState(state),
        contentPackState: selectContentPackState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchContentPacks: bindActionCreators(fetchContentPacks, dispatch)
});

const ContentPacksConsole = (props: Props) => {
    const {
        fetchContentPacks,
        contentPackState
    } = props;
    const classes = useStyles();
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [contentPackDetailsModalOpen, setContentPackDetailsModalOpen] = useState(false);
    const [selectedContentPack, setSelectedContentPack] = useState({ avatars: [], scenes: []});
    const contentPacks = contentPackState.get('contentPacks');

    const openDownloadModal = () => {
        setDownloadModalOpen(true);
    };
    const closeDownloadModal = () => {
        setDownloadModalOpen(false);
    };

    const openDetailsModal = (contentPack: any) => {
        setSelectedContentPack(contentPack);
        setContentPackDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setSelectedContentPack({avatars: [], scenes: []});
        setContentPackDetailsModalOpen(false);
    };

    useEffect(() => {
        if (contentPackState.get('updateNeeded') === true) {
            fetchContentPacks();
        }
    }, [contentPackState]);

    return (
        <div>
            <ConfirmProvider>
               <Button
                   variant="contained"
                   color="primary"
                   onClick={openDownloadModal}
               >
                   Download From URL
               </Button>
            </ConfirmProvider>
            <List
                className={styles['pack-list']}
                component="nav"
                aria-labelledby="current-packs"
                subheader={
                    <ListSubheader component="div" id="current-packs">
                        Current Content Packs
                    </ListSubheader>
                }
            >
                { contentPacks.map(contentPack =>
                    <ListItem key={contentPack.name} onClick={() => openDetailsModal(contentPack)} button>
                        <ListItemText>{contentPack.name}</ListItemText>
                    </ListItem>
                )}
            </List>
            <ContentPackDetailsModal
                contentPack={selectedContentPack}
                open={contentPackDetailsModalOpen}
                handleClose={() => closeDetailsModal()}
            />
            <DownloadModal
                open={downloadModalOpen}
                handleClose={closeDownloadModal}
            />
        </div>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContentPacksConsole));