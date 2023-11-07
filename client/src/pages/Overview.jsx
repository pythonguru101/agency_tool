import { useState, useEffect, Fragment } from "react";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import Modal from "../components/Modal";
import DashHeader from "../components/DashHeader";
import StatComponent from "../components/StatComponent";
import SelectorComponent from "../components/SelectorComponent";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import TableInfoComponent from "../components/TableInfoComponent";
import GraphBars from "../components/GraphBars";
import { Link } from "react-router-dom";
import axios from "axios";

function Overview({ Refresh }) {
  const [Campaigns, setCampaigns] = useState([]);
  const [threads, setThreads] = useState([]);
  const [messagesSent, setMessagesSent] = useState(0);
  const [leadsScrapped, setLeadsScrapped] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [graphData, setGraphData] = useState({});// {Labels, TotalScrappedList, TotalSentList}
  const [stats, setStats] = useState({});// {messagesSentPourcentage, leadsScrappedPourcentage, tasksCountPourcentage}
  const { currentUser } = useAuthValue();
  const [user, setUser] = useState(false);

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
      setThreads(threads);
      let campaigns = [];
      for (const thread in threads) {
        if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
        campaigns.push({
          CampaignName: threads[thread].data.campaignname,
          DateCreated: new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US'),
          Status: {"offline":"Inactive", "online":"Active", "done":"Done"}[threads[thread].status],
          status: threads[thread].status,
          Sent: threads[thread].data.finished||0,
          ID: threads[thread].ID,
          Type: "campaigns",
        })
      }
      // Last
      setCampaigns(campaigns);
    }).catch((err) => {
      console.error(err);
    })
  }

  useEffect(() => {
    reThreads()
    setUser(JSON.parse(localStorage.getItem('user')))
  }, [Refresh])

  function getMessagesSent() {
    // Addition of all the campaigns .finished
    let messagesSent = 0;
    // According to threads for 0 & 1
    for (const thread in threads) {
      if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
      messagesSent += threads[thread].data.finished||0;
    }
    return messagesSent;
  }
  
  function getLeadsScrapped() {
    // Addition of all the campaigns .finished
    let leadsScrapped = 0;
    // According to threads for 0 & 1
    for (const thread in threads) {
      if (threads[thread].assignment !== "2" && threads[thread].assignment !== "3" && threads[thread].assignment !== "4") continue;
      leadsScrapped += threads[thread].data.finished||0;
    }
    return leadsScrapped;
  }

  function getTasksCount() {
    // length of threads
    return threads.length;
  }

  useEffect(() => {
    setMessagesSent(getMessagesSent());
    setLeadsScrapped(getLeadsScrapped());
    setTasksCount(getTasksCount());
  }, [threads, Refresh])

  function buildGraphData() {
    // Get the last 7 days
    let last7Days = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString('en-US'));
    }
    // Get the last 7 days of messages sent
    let last7DaysMessagesSent = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      let messagesSent = 0;
      for (const thread in threads) {
        if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          messagesSent += threads[thread].data.finished||0;
        }
      }
      last7DaysMessagesSent.push(messagesSent);
    }
    // Get the last 7 days of leads scrapped
    let last7DaysLeadsScrapped = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      let leadsScrapped = 0;
      for (const thread in threads) {
        // Get only done
        if (threads[thread].assignment !== "2" && threads[thread].assignment !== "3" && threads[thread].assignment !== "4") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          leadsScrapped += threads[thread].data.finished||0;
        }
      }
      last7DaysLeadsScrapped.push(leadsScrapped);
    }
    return {
      Labels: last7Days.reverse(),
      TotalScrappedList: last7DaysLeadsScrapped.reverse(),
      TotalSentList: last7DaysMessagesSent.reverse(),
    }
  }

  function buildStats() {
    // Compare between this week and last week
    // Get the current week and the last week
    // Get the messages sent for each week
    // Get the leads scrapped for each week
    // Get the tasks count for each week
    // Turn them into percentages means => new / old * 100
    // Return them
    let thisWeekMessagesSentCount = 0;
    let lastWeekMessagesSentCount = 0;
    let thisWeekLeadsScrappedCount = 0;
    let lastWeekLeadsScrappedCount = 0;
    let thisWeekTasksCount = 0;
    let lastWeekTasksCount = 0;

    // Get the last 7 days count of messages sent, leads scrapped, tasks count
    for (let i = 0; i < 1; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          thisWeekMessagesSentCount += threads[thread].data.finished||0;
        }
      }
    }
    for (let i = 7; i < 14; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        if (threads[thread].assignment !== "0" && threads[thread].assignment !== "1") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          lastWeekMessagesSentCount += threads[thread].data.finished||0;
        }
      }
    }
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        // Get only done
        if (threads[thread].assignment !== "2" && threads[thread].assignment !== "3" && threads[thread].assignment !== "4") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          thisWeekLeadsScrappedCount += threads[thread].data.finished||0;
        }
      }
    }
    for (let i = 7; i < 14; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        // Get only done
        if (threads[thread].assignment !== "2" && threads[thread].assignment !== "3" && threads[thread].assignment !== "4") continue;
        if (threads[thread].status !== "done") continue;
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          lastWeekLeadsScrappedCount += threads[thread].data.finished||0;
        }
      }
    }
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          thisWeekTasksCount++;
        }
      }
    }
    for (let i = 7; i < 14; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      for (const thread in threads) {
        if (new Date(threads[thread].data.DateCreated).toLocaleDateString('en-US') === date.toLocaleDateString('en-US')) {
          lastWeekTasksCount++;
        }
      }
    }

    // Turn them into percentages means => new / old * 100
    let messagesSentPourcentage = ((thisWeekMessagesSentCount - lastWeekMessagesSentCount) / thisWeekMessagesSentCount) * 100;
    let leadsScrappedPourcentage = ((thisWeekLeadsScrappedCount - lastWeekLeadsScrappedCount) / thisWeekLeadsScrappedCount) * 100;
    let tasksCountPourcentage = ((thisWeekTasksCount - lastWeekTasksCount) / thisWeekTasksCount) * 100;

    // Turn into integers
    messagesSentPourcentage = parseInt(messagesSentPourcentage);
    leadsScrappedPourcentage = parseInt(leadsScrappedPourcentage);
    tasksCountPourcentage = parseInt(tasksCountPourcentage);
    
    // Turn the NAN into 0
    messagesSentPourcentage = isNaN(messagesSentPourcentage) ? 0 : messagesSentPourcentage;
    leadsScrappedPourcentage = isNaN(leadsScrappedPourcentage) ? 0 : leadsScrappedPourcentage;
    tasksCountPourcentage = isNaN(tasksCountPourcentage) ? 0 : tasksCountPourcentage;
    
    // Now format them into this format +7% or -15% (string)
    messagesSentPourcentage = messagesSentPourcentage > 0 ? `+${messagesSentPourcentage}%` : `${messagesSentPourcentage}%`;
    leadsScrappedPourcentage = leadsScrappedPourcentage > 0 ? `+${leadsScrappedPourcentage}%` : `${leadsScrappedPourcentage}%`;
    tasksCountPourcentage = tasksCountPourcentage > 0 ? `+${tasksCountPourcentage}%` : `${tasksCountPourcentage}%`;

    return {
      messagesSentPourcentage,
      leadsScrappedPourcentage,
      tasksCountPourcentage,
    }
  }
    
  useEffect(() => {
    setGraphData(buildGraphData());
    setStats(buildStats());
  }, [threads, Refresh])

      

  return (
    <Fragment>
      <div className="p-10 w-full space-y-5 flex flex-col justify-start">
        <DashHeader dash_title_message={"Welcome Back."}/>
        {user?.pricing !== 'trial' ?
          ""
          :
          <div className="flex flex-wrap gap-5 justify-center" style={{color: '#a59733'}}>Your account is free trial and limited!
          <a href={"https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]="+currentUser} style={{textDecoration: 'underline', color: 'rgb(211 186 11)'}}>UPGRADE TO PREMIUM?</a></div>
        }
        <div className="flex flex-wrap gap-5 justify-center">
          {/* Make something for pourcentage here : should do statnow/statbefore*100 */}
          <StatComponent description={"Messages Sent"} pourcentage={stats.messagesSentPourcentage} stat={messagesSent}/>
          <StatComponent description={"Leads Scrapped"} pourcentage={stats.leadsScrappedPourcentage} stat={leadsScrapped}/>
          <StatComponent description={"Tasks Count"} pourcentage={stats.tasksCountPourcentage} stat={tasksCount}/>
        </div>
        {/* Basically all the days of the week, and the number of messages sent on each day & the number of leads scrapped on each day */}
        <GraphBars Labels={graphData.Labels} TotalScrappedList={graphData.TotalScrappedList} TotalSentList={graphData.TotalSentList}/>
        <TableInfoComponent tablefragementsperpage={7} tableHeaders={[
            "Campaign Name",
            "Date Created",
            "Status",
            "Sent",
        ]} tableFragments={Campaigns} Title={"Campaigns"} TriggerRefresh={()=>triggerrefresh()}/>
      </div>
    </Fragment>
  )
}

export default Overview;
