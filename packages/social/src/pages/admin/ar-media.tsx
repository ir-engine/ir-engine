
/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
 import React, { useEffect } from "react";

 import Dashboard  from "@xrengine/client-core/src/socialmedia/components/Dashboard";
 import ArMediaConsole  from "@xrengine/client-core/src/admin/components/ArMediaConsole";
 import { bindActionCreators, Dispatch } from "redux";
 import { connect } from "react-redux";
 
 import { selectAdMediaState } from "@xrengine/client-core/src/socialmedia/reducers/arMedia/selector";
 import { getArMediaService } from "@xrengine/client-core/src/socialmedia/reducers/arMedia/service";
 
 const mapStateToProps = (state: any): any => {
   return {
     arMediaState: selectAdMediaState(state),
   };
 };
 
 const mapDispatchToProps = (dispatch: Dispatch): any => ({
   getArMedia: bindActionCreators(getArMediaService, dispatch),
 });
 interface Props{
   arMediaState?: any,
   getArMedia?: any
 }
 
  const ArMediaPage = ({arMediaState, getArMedia}:Props) => {
     useEffect(()=> getArMedia('admin'), []);
     const arMediaList = arMediaState.get('fetching') === false && arMediaState?.get('adminList') ? arMediaState.get('adminList') : null;
     console.log('ArMediaPage');
    return (<>
     <div>
       <Dashboard>
           <ArMediaConsole list={arMediaList}/>
         </Dashboard>
     </div>
   </>
   );
 };
 
 export default connect(mapStateToProps, mapDispatchToProps)(ArMediaPage); 