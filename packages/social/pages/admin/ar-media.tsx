
/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from "react";

import Dashboard  from "@xr3ngine/client-core/src/socialmedia/components/Dashboard";
import ArMediaConsole  from "@xr3ngine/client-core/src/admin/components/ArMediaConsole";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { selectArMediaState } from "@xr3ngine/client-core/src/socialmedia/reducers/arMedia/selector";
import { getArMedia } from "@xr3ngine/client-core/src/socialmedia/reducers/arMedia/service";

const mapStateToProps = (state: any): any => {
  return {
    arMediaState: selectArMediaState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getArMedia: bindActionCreators(getArMedia, dispatch),
});
interface Props{
  arMediaState?: any,
  getArMedia?: any
}

 const ArMediaPage = ({arMediaState, getArMedia}:Props) => {
    useEffect(()=> getArMedia('admin'), []);
    const arMediaList = arMediaState.get('fetching') === false && arMediaState?.get('arMediaAdmin') ? arMediaState.get('arMediaAdmin') : null;
   return (<>
    <div>
      <Dashboard>
          {arMediaList && <ArMediaConsole list={arMediaList}/>}
        </Dashboard>
    </div>
  </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaPage);