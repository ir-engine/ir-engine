/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

// @ts-ignore
import styles from './TipsAndTricks.module.scss';
import { connect } from 'react-redux'
import { getTipsAndTricks } from '@xr3ngine/client-core/src/socialmedia/reducers/tips_and_tricks/service'
import { selectTipsAndTricksState } from "@xr3ngine/client-core/src/socialmedia/reducers/tips_and_tricks/selector";
import { bindActionCreators, Dispatch } from 'redux'
import { doLoginAuto } from "@xr3ngine/client-core/src/user/reducers/auth/service";

const mapStateToProps = (state: any): any => {
    return {
        tipsAndTricksState: selectTipsAndTricksState(state),
    };
};
const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getTipsAndTricks: bindActionCreators(getTipsAndTricks, dispatch),
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
});
interface Props{
    tipsAndTricksState?: any,
    getTipsAndTricks?: any,
    doLoginAuto?: any
}



export const TipsAndTricks = ({tipsAndTricksState, getTipsAndTricks, doLoginAuto}:Props) => {
    const data=[];
    for(let i=0; i<random(10); i++){
        data.push({ 
            title: 'Created Tips & Tricks',
            description: 'I recently understood the words of my friend Jacob West about music.'
        });
    }
    useEffect(()=> {
        doLoginAuto(true)
        getTipsAndTricks()
    }, []);
    const tipsAndTricksList = tipsAndTricksState?.get('tips_and_tricks') && tipsAndTricksState?.get('tips_and_tricks');
    useEffect(()=>  console.log(tipsAndTricksList), [tipsAndTricksList]);


    return <section className={styles.tipsandtricksContainer}>
        {data.map((item, itemindex)=>
            <Card className={styles.tipItem} square={false} elevation={0} key={itemindex}>
                <CardMedia   
                    className={styles.previewImage}      
                    component='video'            
                    src={'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'}
                    title={item.title}
                    controls
                />
                <CardContent>
                    <Typography className={styles.tipsTitle} variant="h2">{item.title}</Typography>
                    <Typography variant="h2">{item.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>;
};


export default connect(mapStateToProps, mapDispatchToProps)(TipsAndTricks)
