/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { useHistory } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { getCreators } from '../../reducers/creator/service';
// @ts-ignore
import styles from './Creators.module.scss';
import SharedModal from '../SharedModal';
import Creator from '../Creator';

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
    const [creator, setCreator] = useState(false);
    const [creatorId, setCreatorId] = useState(null);
    useEffect(()=> getCreators(), []);
    const creators= creatorsState && creatorsState.get('creators') ? creatorsState.get('creators') : null;
    const handleCreatorView = (id) =>{
        setCreatorId(id)
        setCreator(true);
    };
    const handleClose = () => {
        setCreator(false);
    };
    return <section className={styles.creatorContainer}>
        {creators?.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex} onClick={()=>handleCreatorView(item.id)}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.avatar}
                    title={item.name}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{item.name} 
                        {item.verified === 1 && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                    </Typography>
                    <Typography variant="h4" align="center" color="secondary">{item.username}</Typography>
                </CardContent>
            </Card>
        )}
        {creator && creatorId &&  <SharedModal 
                    open={creator}
                    onClose={handleClose} 
                >
                    <Creator creatorId={creatorId} />
                </SharedModal>}
        </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Creators);