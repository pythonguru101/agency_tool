import { Fragment, useEffect, useState } from "react";

//  Import the react-icons
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaFire } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

// Import components
import { Outlet } from "react-router-dom";
import Modal from "./Modal";
import Menu from "./Menu";
import { useLocation } from 'react-router-dom';

function Layout() {
  const [showDisplay, setShowDisplay] = useState(true)
  const [displayBar, setDisplayBar] = useState(false);
  const [displayModalAccounts, setDisplayModalAccounts] = useState(false);
  const [displayModalProxies, setDisplayModalProxies] = useState(false);
  const location = useLocation();

  // If the route is /login or /register, don't show the display
  useEffect(() => {

    (function handleIntercom () {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: "j1zvd5h2",
        // name: userInfo.name, // Full name
        email: userInfo.email, // Email address
        created_at: "2021-10-04"// Signup date as a Unix timestamp
      };

      var w = window;
      var ic = w.Intercom;
      if (typeof ic === "function") {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
      } else {
        var d = document;
        var i = function () { i.c(arguments); };
        i.q = []; i.c = function (args) { i.q.push(args); };
        w.Intercom = i;
        var l = function () {
          var s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true; s.src = 'https://widget.intercom.io/widget/j1zvd5h2';
          var x = d.getElementsByTagName('script')[0];
          x.parentNode.insertBefore(s, x);
        };
        if (document.readyState === 'complete') { l(); }
        else if (w.attachEvent) { w.attachEvent('onload', l); }
        else { w.addEventListener('load', l, false); }
      }
    })();

    if (location.pathname === "/SignIn" || location.pathname === "/register") {
      setShowDisplay(false);
    } else {
      setShowDisplay(true);
    }
  }, [location.pathname]);

  return (
    <Fragment>
      <div className={`flex bg-neutral-900 min-w-fit w-full h-full min-h-screen justify-center`}>
        {
          displayBar ? (
            <div className="bg-neutral-800 pr-4 border-r max-w-fit border-neutral-500/20 drop-shadow-2xl flex flex-col fixed h-full left-0 z-10 justify-between">
              <div>
                <div onClick={() => setDisplayBar(!displayBar)} className="flex justify-center m-3 mt-5 hover:opacity-50 transition duration-300 cursor-pointer">
                  <img className="bg-indigo-500 w-20 h-20 rounded-xl"
                    src="https://cdn.discordapp.com/attachments/1122198270983290991/1127996690503315476/ap4.png" alt="" />
                </div>
                <Menu icon={<FaHome />} title={"Overview"} route={"/dashboard"} />
                <Menu icon={<FaUser />} title={"Leads"} route={"leads"} />
                <Menu icon={<FaFire />} title={"Campaigns"} route={"campaigns"} />
                <Menu icon={<FaUserFriends />} title={"Accounts"} isRoute={false} activate={() => { setDisplayModalAccounts(!displayModalAccounts); setDisplayBar(!displayBar) }} />
                {/*<Menu icon={<FaCog/>} title={"Proxies"} isRoute={false} activate={()=>{setDisplayModalProxies(!displayModalProxies); setDisplayBar(!displayBar)}} />*/}
                <Menu icon={<FaTwitter />} title={"Twitter"} route={"twitter"} />
              </div>
              <div>
                <Menu icon={<FaStar />} title={"Pricing"} route={"Upgrade"} />
                
                <Menu
                  className="flex justify-center items-center w-full h-20 hover:bg-red-500 transition duration-300"
                  icon={<FaSignOutAlt />}
                  isRoute={false}
                  title={"Log Out"}
                  activate={() => {
                    localStorage.removeItem("ig");
                    localStorage.removeItem("user");
                    window.location.reload();
                  }}
                />
                {/* <Menu icon={<FaCog/>} title={"Settings"} /> */}
              </div>
            </div>
          ) : showDisplay ? (
            <div onClick={() => setDisplayBar(!displayBar)} className="flex justify-center mt-5 opacity-10 hover:opacity-100 transition duration-300 cursor-pointer fixed left-11">
              <img className="bg-indigo-500 w-20 h-20 rounded-xl"
                src="https://cdn.discordapp.com/attachments/1122198270983290991/1127996690503315476/ap4.png" alt="" />
            </div>
          ) : ("")
        }
        <Outlet />
        {displayBar ? (
          <div onClick={() => setDisplayBar(!displayBar)} className='fixed inset-0 bg-black p-10 bg-opacity-25 backdrop-blur-sm flex justify-center items-center text-white text-2xl' />
        ) : ""
        }
      </div>
      <Modal Type={"Accounts"} Activated={displayModalAccounts} Title={"Manage Accounts"} Close={() => setDisplayModalAccounts(!displayModalAccounts)} />
      <Modal Type={"Proxies"} Activated={displayModalProxies} Title={"Manage Proxy"} Close={() => setDisplayModalProxies(!displayModalProxies)} />
    </Fragment>
  );
}

export default Layout;
