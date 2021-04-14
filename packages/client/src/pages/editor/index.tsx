import { useHistory } from 'react-router-dom';
import { useEffect } from "react";


/**
 * Function for routing the request to editor/projects.
 */

export default function LandingPage () {
	
	// Creating router object.
	  const router = useHistory();
	  useEffect(() => {
	    router.push("/editor/projects");
	  });
	  
	   return null;
}
