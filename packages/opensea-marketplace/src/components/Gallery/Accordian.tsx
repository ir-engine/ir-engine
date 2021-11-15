import { title } from 'process';
import { useCallback, useEffect, useState } from 'react'

import './accordian.style.css'




const Accordian = (props:any) => {
    const [isActive, setIsActive] = useState(false);

  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <div>{props.title}</div>
        <div>{isActive ? '-' : '+'}</div>
      </div>
      {isActive && <div className="accordion-content">{props.children}</div>}
    </div>
  );
  
}

export { Accordian }
