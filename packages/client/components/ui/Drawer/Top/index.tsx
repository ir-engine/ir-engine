import React, { useState, useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { selectFriendState } from '../../../../redux/friend/selector';
import { selectGroupState } from '../../../../redux/group/selector';
import { selectPartyState } from '../../../../redux/party/selector';

import {
    getFriends,
    unfriend
} from '../../../../redux/friend/service';
import {
    getGroups,
    createGroup,
    patchGroup,
    removeGroup
} from '../../../../redux/group/service';
import {
    getParty,
    createParty,
    removeParty,
    removePartyUser
} from '../../../../redux/party/service';
import {User} from "@xr3ngine/common/interfaces/User";
import { AppBar } from '@material-ui/core';


const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        partyState: selectPartyState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    unfriend: bindActionCreators(unfriend, dispatch),
    getGroups: bindActionCreators(getGroups, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    getParty: bindActionCreators(getParty, dispatch),
    createParty: bindActionCreators(createParty, dispatch),
    removeParty: bindActionCreators(removeParty, dispatch),
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
});

interface Props {
    auth: any;
    friendState?: any;
    getFriends?: any;
    unfriend?: any;
    groupState?: any;
    groupUserState?: any;
    getGroups?: any;
    createGroup?: any;
    patchGroup?: any;
    removeGroup?: any;
    getGroupUsers?: any;
    getSelfGroupUser?: any;
    removeGroupUser?: any;
    partyState?: any;
    getParty?: any;
    createParty?: any;
    removeParty?: any;
    getPartyUsers?: any;
    getSelfPartyUser?: any;
    removePartyUser?: any;
}

const TopDrawer = (props: Props): any => {
    const {
    } = props;

    return (
        <div className="top-drawer">
            <AppBar position="fixed" className="drawer" />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(TopDrawer);
