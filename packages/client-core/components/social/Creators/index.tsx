import React from 'react';
import { random } from 'lodash';
import Router from "next/router";

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

import styles from './Creators.module.scss';

const Creators = () => { 
    const data=[];
    for(let i=0; i<random(50, 5); i++){
        data.push({ 
            avatar :'https://picsum.photos/158/210',
            name: 'User username',
            username: '@username',
        })
    }
    const handleCreatorView = (username) =>{
        Router.push('/creator')
    }

    return <section className={styles.creatorContainer}>
        {data.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex} onClick={()=>handleCreatorView(item.username)}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.avatar}
                    title={item.name}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{item.name} 
                            <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>
                    </Typography>
                    <Typography variant="h4" align="center" color="secondary">{item.username}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default Creators;