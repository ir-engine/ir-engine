
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";
import FeedMenu from "@xr3ngine/client-core/src/socialmedia/components/FeedMenu";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import { selectCreatorsState } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/selector";
import {Stories} from '@xr3ngine/client-core/src/socialmedia/components/Stories';
import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import { User } from "@xr3ngine/common/src/interfaces/User";
import { doLoginAuto } from "@xr3ngine/client-core/src/user/reducers/auth/service";
import { createCreator } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/service";

// @ts-ignore
import styles from './index.module.scss';
import { selectPopupsState } from "@xr3ngine/client-core/src/socialmedia/reducers/popupsState/selector";
import { updateCreatorFormState, updateCreatorPageState, updateFeedPageState } from "@xr3ngine/client-core/src/socialmedia/reducers/popupsState/service";
import SharedModal from "@xr3ngine/client-core/src/socialmedia/components/SharedModal";
import Creator from "@xr3ngine/client-core/src/socialmedia/components/Creator";
import Feed from "@xr3ngine/client-core/src/socialmedia/components/Feed";
import CreatorForm from "@xr3ngine/client-core/src/socialmedia/components/CreatorForm";
        
const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),
    // creatorsState: selectCreatorsState(state),   
    popupsState: selectPopupsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
  updateCreatorFormState:bindActionCreators(updateCreatorFormState, dispatch),
});

const  Home = ({ createCreator,  doLoginAuto, auth, popupsState, updateCreatorPageState, updateFeedPageState, updateCreatorFormState }) => {
  /*hided for now*/
  useEffect(()=>{
    if(auth){
      // const user = auth.get('authUser')?.identityProvider.type === 'guest' ? auth.get('user') as User : auth.get('authUser')?.identityProvider as User;
      //   const userId = user ? user.id : null;
      //   if(userId){}
          createCreator();
             
    }
  },[auth]);

  useEffect(() => doLoginAuto(true), []); 

  //common for creator page
  const creatorPageState = popupsState?.get('creatorPage');
  const creatorId = popupsState?.get('creatorId');
  const handleCreatorClose = () => updateCreatorPageState(false);
  const renderCreatorModal = () => 
      popupsState?.get('creatorPage') === true && popupsState?.get('creatorId') &&  
          <SharedModal 
              open={popupsState?.get('creatorPage')}
              onClose={handleCreatorClose} 
              className={styles.creatorPopup}
          >
          <Creator creatorId={popupsState?.get('creatorId')} />
          </SharedModal>;
  useEffect(()=> {renderCreatorModal();}, [creatorPageState, creatorId]);


  //common for feed page
  const feedPageState = popupsState?.get('feedPage');
  const feedId = popupsState?.get('feedId');
  const handleFeedClose = () =>updateFeedPageState(false);
  const renderFeedModal = () =>
    popupsState?.get('feedPage') === true &&  
        <SharedModal 
            open={popupsState?.get('feedPage')}
            onClose={handleFeedClose} 
            className={styles.feedPagePopup}
        >
            <Feed />     
            <AppFooter /> 
        </SharedModal>;
  useEffect(()=>{renderFeedModal();}, [feedPageState,feedId]);

  //common for creator form
  const handleCreatorFormClose = () => {
    updateCreatorFormState(false);
};
const renderCreatoFormModal = () =>
    popupsState?.get('creatorForm') === true &&  
        <SharedModal 
            open={popupsState?.get('creatorForm')}
            onClose={handleCreatorFormClose} 
            className={styles.creatorFormPopup}
        >
            <CreatorForm />      
            <AppFooter onGoHome={handleCreatorFormClose}/>
        </SharedModal>;

const creatorFormState = popupsState?.get('creatorForm');
useEffect(()=>{renderCreatoFormModal();}, [creatorFormState]);

  return (<>
    <div className={styles.viewport}>
        <AppHeader logo="/assets/logoBlack.png" />
        {/* <Stories stories={stories} /> */}
        <FeedMenu />
        <AppFooter onGoHome={handleCreatorClose}/>
        {renderCreatorModal()}
        {renderCreatoFormModal()}
        {renderFeedModal()}
    </div>
  </>
  );
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);
