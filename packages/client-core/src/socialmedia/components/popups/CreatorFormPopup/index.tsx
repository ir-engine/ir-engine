import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { selectPopupsState } from "../../../reducers/popupsState/selector";
import { updateCreatorFormState } from "../../../reducers/popupsState/service";
import SharedModal from "../../SharedModal";
import AppFooter from "../../Footer";

//@ts-ignore
import styles from './CreatorFormPopup.module.scss';
import CreatorForm from "../../CreatorForm";

const mapStateToProps = (state: any): any => {
    return {
      popupsState: selectPopupsState(state),
    };
  };

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch),
});

interface Props{
    popupsState?: any;
    updateCreatorFormState?: typeof  updateCreatorFormState;
    webxrRecorderActivity: any;
}
export const CreatorFormPopup = ({popupsState, updateCreatorFormState, webxrRecorderActivity}: Props) =>{
  //common for creator form
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const handleCreatorFormClose = () =>updateCreatorFormState(false);

  const renderCreatoFormModal = () =>
    popupsState?.get('creatorForm') === true && !webxrRecorderActivity &&
        <SharedModal
            open={popupsState?.get('creatorForm')}
            onClose={handleCreatorFormClose}
            className={isIOS ? styles.creatorFormPopup+' '+styles.isIos  : styles.creatorFormPopup}
        >
            <CreatorForm />
            <AppFooter />
        </SharedModal>;

const creatorFormState = popupsState?.get('creatorForm');
useEffect(()=>{renderCreatoFormModal();}, [creatorFormState]);
return  renderCreatoFormModal();
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatorFormPopup);
