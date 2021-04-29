/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react';

import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import Avatar from '@material-ui/core/Avatar';
import { bindActionCreators, Dispatch } from 'redux';
import { updateCreatorPageState } from '../../reducers/popupsState/service';
import { connect } from 'react-redux';

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
});

interface Props{
    creator?: any;
    updateCreatorPageState?: typeof updateCreatorPageState;
}
const CreatorAsTitle = ({creator, updateCreatorPageState} : Props) => { 
    return  creator ? 
                <CardHeader
                    avatar={<Avatar src={creator.avatar} alt={creator.username} onClick={()=>updateCreatorPageState(true, creator.id)}/>} 
                    title={<Typography variant="h6">
                    {creator.username}
                    {creator.verified === true && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                </Typography>}
                />               
        :<></>;
};

export default connect(null, mapDispatchToProps)(CreatorAsTitle);