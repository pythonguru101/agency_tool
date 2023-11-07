import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';


function Menu({ icon, title, route, isRoute, activate}) {
  const Route = route ? route : "/"+title;
  const [style, setStyle] = useState("");
  const location = useLocation();

  if(isRoute !== undefined && !isRoute){
    return (
      <div onClick={()=>activate()} className={`pr-3 cursor-pointer h-fit w-full transition duration-300 hover:drop-shadow-2xl ${style}`}>
        <div className={`text-neutral-500 h-16 font-bold text-xl pl-5 flex items-center gap-x-3 transition hover:text-white ${style} ${title==="Upgrade"? "hover:text-amber-400":""}`}>
          {icon}
          <h3>{title}</h3>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (location.pathname === Route) {
      setStyle("text-white");
    } else {
      setStyle("");
    }
  }, [location.pathname]);

  return (
    <div className={`pr-3 h-fit w-full transition duration-300 hover:drop-shadow-2xl ${style}`}>
      <Link to={route ? route : title}>
        <div className={`text-neutral-500 h-16 font-bold text-xl pl-5 flex items-center gap-x-3 transition hover:text-white ${style} ${title==="Upgrade"? "hover:text-amber-400":""}`}>
          {icon}
          <h3>{title}</h3>
        </div>
      </Link>
    </div>
  );
}

export default Menu;
