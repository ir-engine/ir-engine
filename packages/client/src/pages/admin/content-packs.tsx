import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from "redux";
import ContentPackConsole from '@xr3ngine/client-core/src/admin/components/ContentPack/ContentPackConsole';
import { doLoginAuto } from '@xr3ngine/client-core/src/user/reducers/auth/service';
import { connect } from 'react-redux';

interface Props {
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
    return {
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

function ContentPacks(props: Props) {
    const { doLoginAuto } = props;
    useEffect(() => {
        doLoginAuto(true);
    }, []);
    return (<ContentPackConsole />);
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPacks);