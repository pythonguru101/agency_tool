import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import DashHeader from "../components/DashHeader";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import { decryptData } from "../utils/securityTools";
import { Store } from "react-notifications-component";

import TwitterAccounts from "../components/TwitterAccounts";
import TwitterLeads from "../components/TwitterLeads";
import TwitterCampaigns from "../components/TwitterCampaigns";

import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function Twitter({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("All");
  const [Leads, setLeads] = useState([]);
  const { currentUser } = useAuthValue();
  const [currentTab, setCurrentTab] = useState('accounts');

  const theme = useTheme();
   
  return (
    <Fragment>
      <div className="p-10 w-full space-y-10 flex flex-col justify-start">
        <DashHeader dash_title_message={"Twitter Leads & Campaigns!"}/>
        <div className="h-full bg-neutral-800/50 min-w-fit h-fit rounded-xl border drop-shadow border-neutral-400/20 p-5">
          <Tabs
            value={currentTab}
            onChange={setCurrentTab}
            indicatorColor="secondary"
            textColor="secondary"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab style={{color: 'rgb(163 163 163 / 0.8)'}} label="Accounts" value="accounts" onClick={()=>setCurrentTab('accounts')} />
            <Tab style={{color: 'rgb(163 163 163 / 0.8)'}} label="Leads" value="leads" onClick={()=>setCurrentTab('leads')} />
            <Tab style={{color: 'rgb(163 163 163 / 0.8)'}} label="Campaigns" value="campaigns" onClick={()=>setCurrentTab('campaigns')} />
          </Tabs>
          <div>
            { currentTab === 'accounts' && <TwitterAccounts /> }
            { currentTab === 'leads' && <TwitterLeads /> }
            { currentTab === 'campaigns' && <TwitterCampaigns/> }
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Twitter;
