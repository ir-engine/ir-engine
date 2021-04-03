
import React, { useEffect } from "react";

import Dashboard  from "@xr3ngine/client-core/src/common/components/Layout/SocialDashboard";
import CreatorConsole  from "@xr3ngine/client-core/src/common/components/Admin/CreatorConsole";
import { selectCreatorsState } from "@xr3ngine/client-core/reducers/creator/selector";
import { getCreators } from "@xr3ngine/client-core/reducers/creator/service";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";

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


interface Props{
  creatorsState?: any,
  getCreators?: any,
}

 const UsersPage = ({creatorsState, getCreators}:Props) => {
  useEffect(()=> getCreators(), [creatorsState.get('currentCreator')]);
  const creators= creatorsState && creatorsState.get('fetching') === false && creatorsState.get('creators') ? creatorsState.get('creators') : null;
   return (<>
    <div>
      <Dashboard>
            {creators && <CreatorConsole list={creators}/>}
        </Dashboard>
    </div>
  </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);