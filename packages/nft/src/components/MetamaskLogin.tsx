import { Button } from "@material-ui/core";
import React from "react";

export type MetamaskLoginProps = {
  onClickConnect(): void
}

const MetamaskLogin = ({ onClickConnect }: MetamaskLoginProps) => {
  return (
    <div>
      <Button
        onClick={onClickConnect}
      >
        CONNECT METAMASK
      </Button>
    </div>
  );
};

export default MetamaskLogin;
