import React from 'react';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

const CreatorAsTitle = ({creator}) : any => {    
    return  creator ? 
                <CardHeader
                    avatar={<img src={creator.avatar} />} 
                    title={<Typography variant="h2">
                                {creator.username}
                                <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>
                            </Typography>}
                />
               
        :''
};

export default CreatorAsTitle;