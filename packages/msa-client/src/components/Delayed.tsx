import { useEffect, useState } from "react";

const Delayed = (props: any) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsShown(true);
    }, props.waitBeforeShow);

    return () => {
      clearTimeout(timer);
    };
  }, [props.waitBeforeShow]);

  return isShown ? (
    props.children
  ) : props.spinner ? (
    <>{props.spinner()}</>
  ) : null;
};

export default Delayed;
