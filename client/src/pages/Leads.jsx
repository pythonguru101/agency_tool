import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import DashHeader from "../components/DashHeader";
import StatComponent from "../components/StatComponent";
import SelectorComponent from "../components/SelectorComponent";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import TableInfoComponent from "../components/TableInfoComponent";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import { decryptData } from "../utils/securityTools";
import { Store } from "react-notifications-component";

function Leads({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("All");
  const [Leads, setLeads] = useState([]);
  const { currentUser } = useAuthValue();
  
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

  function defineStatus(status, threadDate) {
    //  Status New, Qualified, Lost
    // See difference between the date now in timestamp and the date of the thread if it's more than 1 week then it's lost if 2 days then it's new else it's qualified
    if (status==="done") {
      return "Done"
    }
    const now = Date.now();
    const diff = now - threadDate;
    // 604800000 is 1 week in milliseconds
    // 172800000 is 2 days in milliseconds
    // 5 days : 432000000
    if (diff > 604800000) {
      return "Old";
    } else if (diff < 172800000) {
      return "New";
    } else {
      return "Qualified"
    }
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
        if (threads[thread].assignment !== "2" && threads[thread].assignment !== "3" && threads[thread].assignment !== "4") continue;
        campaigns.push({
          CampaignName: threads[thread].data.leadname,
          DateCreated: new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US'),
          Status: defineStatus(threads[thread].status, threads[thread].data.DateCreated),
          Headcount: threads[thread].data.finished,
          status:threads[thread].status,
          ID: threads[thread].ID,
          Type:"leads",
          Leads:threads[thread].data.result,
        })
      }
      setLeads(campaigns);
    }).catch((err) => {
      console.error(err);
    })
  }

  useEffect(() => {
    reThreads()
  }, [Refresh])
  
  return (
    <Fragment>
      <div className="p-10 w-full space-y-10 flex flex-col justify-start">
        <DashHeader dash_title_message={"Watch Your Leads!"}/>
        <div className="flex flex-wrap gap-5 justify-between items-center align-center">
          <SelectorComponent selectors={[
              "All",
              "New",
              "Qualified",
              "Old",
              "Done"
          ]} selected={selected} setSelected={setSelected} />
          <ModalActivator Name={"Create"} Action={()=> setShowModal(true)}/>
        </div>
        <TableInfoComponent tableHeaders={[
            "Lead Name",
            "Date Created",
            "Status",
            "Headcount"
        ]} tableFragments={Leads} Title={"Leads"} filter={selected} tablefragementsperpage={9} TriggerRefresh={()=>triggerrefresh()}/>
      </div>
      <Modal Leads={Leads} Activated={showModal} Title={"Create Your Lead Source!"} Close={()=>setShowModal(false)} Type={"Leads"} TriggerRefresh={triggerrefresh}/>
    </Fragment>
  )
}

export default Leads;
