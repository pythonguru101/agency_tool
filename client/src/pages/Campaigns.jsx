import { useState, Fragment, useEffect } from "react";
import Modal from "../components/Modal";
import DashHeader from "../components/DashHeader";
import StatComponent from "../components/StatComponent";
import SelectorComponent from "../components/SelectorComponent";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import TableInfoComponent from "../components/TableInfoComponent";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import axios from "axios";
import { decryptData } from "../utils/securityTools";
import { Store } from "react-notifications-component";

function Campaigns({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("All");
  const [Campaigns, setCampaigns] = useState([]);
  const { currentUser } = useAuthValue();
  const [user, setUser] = useState(false);

  function verifyIGAccount() {
    // Get the data, decryt it and check if there is an ig account selected if not return false
    let data = localStorage.getItem('ig')
    if (!data) {
        console.error("No data found")
        return false
    }
    data = JSON.parse(data)
    let userInfo = decryptData(data.data, `user_${data.id}`)
    if (userInfo === "Error : Invalid key") {
        console.error("Invalid key")
        return false
    }
    if (userInfo) {
        // Get the email and password from string format to json format
        const { igaccounts } = JSON.parse(userInfo)
        if (igaccounts) {
            // Check if there is an account selected
            for (const account in igaccounts) {
                if (igaccounts[account].active) return true
            }
        }
    }
    Store.addNotification({
        title: "Error",
        message: "Please select or add an Instagram account",
        type: "danger",
        insert: "top",
        container: "top-left",
        dismiss: {
            duration: 5000,
            onScreen: true
        }
    });
    return false
  }

  function triggerrefresh() {
    reThreads()
  }

  function reThreads() {
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/users/threads",
      data: {
        email: currentUser,
      }
    }).then((res) => {
      const threads = res.data.data;
      let campaigns = [];
      for (const thread in threads) {
        // Make a filter for the assignment : accept 0 and 1 for now
        if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
        campaigns.push({
          CampaignName: threads[thread].data.campaignname,
          DateCreated: new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US'),
          Status: {"offline":"Inactive", "online":"Active", "done":"Done"}[threads[thread].status],
          Sent:threads[thread].data.finished||0,
          status:threads[thread].status,
          ID: threads[thread].ID,
          Type: "campaigns"
        })
      }
      setCampaigns(campaigns);
    }).catch((err) => {
      console.error(err);
    })
  }

  useEffect(() => {
    reThreads()
    setUser(JSON.parse(localStorage.getItem('user')))
  }, [Refresh])

  return (
    <Fragment>
      <div className="p-10 w-full space-y-5 flex flex-col justify-start">
        <DashHeader dash_title_message={"Launch Your Campaigns!"}/>
        {user?.pricing !== 'trial' ?
          ""
          :
          <div className="flex flex-wrap gap-5 justify-center" style={{color: '#a59733'}}>
          <a href={"https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]="+currentUser} style={{textDecoration: 'underline', color: 'rgb(211 186 11)'}}>UPGRADE TO SEND MESSAGES?</a></div>
        }
        <div className="flex flex-wrap justify-between gap-5 items-center align-center">
          <SelectorComponent selectors={[
              "All",
              "Pending",
              "Active",
              "Inactive"
          ]} selected={selected} setSelected={setSelected}/>
          <ModalActivator Name={"Create"} Action={()=> verifyIGAccount()?setShowModal(true):{}}/>
        </div>
        <TableInfoComponent tableHeaders={[
            "Campaign Name",
            "Date Created",
            "Status",
            "Sent",
        ]} tableFragments={Campaigns} Title={"Campaigns"} filter={selected} TriggerRefresh={() => triggerrefresh()} tablefragementsperpage={7}/>
      </div>
      <Modal Activated={showModal} Title={"Create A Campaign."} Close={()=>setShowModal(false)} Type={"Campaigns"} TriggerRefresh={() => triggerrefresh()}/>
    </Fragment>
  )
}

export default Campaigns;
