import React from 'react';
import { useHistory } from "react-router-dom";

import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { Avatar } from '@material-ui/core';

const CreatorAsTitle = ({creator}) : any => { 
    const history = useHistory();
    return  creator ? 
                <CardHeader
                    avatar={<Avatar src={creator.avatar} alt={creator.username} onClick={()=>history.push('/creator?creatorId=' + creator.id)}/>} 
                    title={<Typography variant="h2">
                    {creator.username}
                    {creator.verified === true && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                </Typography>}
                />               
        :'';
};

export default CreatorAsTitle;