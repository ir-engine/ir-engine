import React, { useEffect } from 'react';
import Router from "next/router";

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

import styles from './Creators.module.scss';
import { selectCreatorsState } from '../../../redux/creator/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { getCreators } from '../../../redux/creator/service';
import { connect } from 'react-redux';

const mapStateToProps = (state: any): any => {
    return {
        creatorsState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getCreators: bindActionCreators(getCreators, dispatch),
});

interface Props{
    creatorsState?: any,
    getCreators?: any,
}

const Creators = ({creatorsState, getCreators}:Props) => { 
    useEffect(()=> getCreators(), []);
    const creators= creatorsState && creatorsState.get('creators') ? creatorsState.get('creators') : null;
    const handleCreatorView = (id) =>{
        Router.push({ pathname: '/creator', query:{ creatorId: id}})
    }
    return <section className={styles.creatorContainer}>
        {creators?.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex} onClick={()=>handleCreatorView(item.id)}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    src={item.avatar}
                    title={item.name}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{item.name} 
                        {item.verified === true && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                    </Typography>
                    <Typography variant="h4" align="center" color="secondary">{item.username}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default connect(mapStateToProps, mapDispatchToProps)(Creators);