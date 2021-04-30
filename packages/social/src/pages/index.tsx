
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
import { updateArMediaState, updateCreatorFormState, updateCreatorPageState, updateFeedPageState,  updateNewFeedPageState, updateShareFormState} from "@xr3ngine/client-core/src/socialmedia/reducers/popupsState/service";
import SharedModal from "@xr3ngine/client-core/src/socialmedia/components/SharedModal";
import Creator from "@xr3ngine/client-core/src/socialmedia/components/Creator";
import Feed from "@xr3ngine/client-core/src/socialmedia/components/Feed";
import CreatorForm from "@xr3ngine/client-core/src/socialmedia/components/CreatorForm";
import ArMedia from "@xr3ngine/client-core/src/socialmedia/components/ArMedia";
import FeedForm from "@xr3ngine/client-core/src/socialmedia/components/FeedForm";
import ShareForm from "@xr3ngine/client-core/src/socialmedia/components/ShareForm/ShareForm"
        
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
  updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch),
  updateShareFormState: bindActionCreators(updateShareFormState,dispatch)
});

const  Home = ({ createCreator,  doLoginAuto, auth, popupsState, updateCreatorPageState, updateFeedPageState, updateCreatorFormState, updateNewFeedPageState, updateShareFormState }) => {
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
          <AppFooter /> 
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
  const handleCreatorFormClose = () =>updateCreatorFormState(false);
  const renderCreatoFormModal = () =>
    popupsState?.get('creatorForm') === true &&  
        <SharedModal 
            open={popupsState?.get('creatorForm')}
            onClose={handleCreatorFormClose} 
            className={styles.creatorFormPopup}
        >
            <CreatorForm />      
            <AppFooter />
        </SharedModal>;

const creatorFormState = popupsState?.get('creatorForm');
useEffect(()=>{renderCreatoFormModal();}, [creatorFormState]);

//common for ArMedia choose
const handleArMediamClose = () =>updateArMediaState(false);
const renderArMediaModal = () =>
  popupsState?.get('arMedia') === true &&  
      <SharedModal 
          open={popupsState?.get('arMedia')}
          onClose={handleArMediamClose} 
          className={styles.arMediaPopup}
      >
        <ArMedia />
      </SharedModal>;

const arMediaState = popupsState?.get('arMedia');
useEffect(()=>{renderArMediaModal();}, [arMediaState]);
//common for new feed page
const handleNewFeedClose = () => {
  updateNewFeedPageState(false);
};
const renderNewFeedModal = () =>
  popupsState?.get('shareFeedPage') === true &&  
      <SharedModal 
          open={popupsState?.get('shareFeedPage')}
          onClose={handleNewFeedClose} 
          className={styles.creatorFormPopup}
      >
          <FeedForm />      
          <AppFooter />
      </SharedModal>;
const newFeedPageState = popupsState?.get('shareFeedPage')
useEffect(()=>{renderNewFeedModal();}, [newFeedPageState]);

//common for share form page
const handleShareFormClose = () => {
  updateShareFormState(false);
};
const renderShareFormModal = () =>
  popupsState?.get('shareForm') === true &&  
      <SharedModal 
          open={popupsState?.get('shareForm')}
          onClose={handleShareFormClose} 
          className={styles.creatorFormPopup}
      >
          <ShareForm />      
          <AppFooter />
      </SharedModal>;
const shareFormState = popupsState?.get('shareForm')
useEffect(()=>{renderShareFormModal();}, [shareFormState]);

  return (<>
    <div className={styles.viewport}>
        <AppHeader logo="/assets/logoBlack.png" />
        {/* <Stories stories={stories} /> */}
        <FeedMenu />
        <AppFooter />
        {renderCreatorModal()}
        {renderCreatoFormModal()}
        {renderFeedModal()}
        {renderArMediaModal()}
        {renderNewFeedModal()}
        {renderShareFormModal()}
    </div>
  </>
  );
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);
