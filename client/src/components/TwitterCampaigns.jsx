import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { BsArrowRight } from "react-icons/bs";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import { Store } from "react-notifications-component";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import { FaRocket } from "react-icons/fa";
import { BsX } from "react-icons/bs";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';

import { io } from "socket.io-client";
import { getCurrentTwitterUser } from "../utils/funcTools";

const socket = io(import.meta.env.VITE_SOCKET_DOMAIN, { transports: ['websocket'] })

function TwitterCampaigns({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [originCampaigns, setOriginCampaigns] = useState([]);
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuthValue();
  const currentTwitterUser = getCurrentTwitterUser();

  const [campaignName, setCampaignName] = useState('')
  const [campaignMsg, setCampaignMsg] = useState('')
  const [selectedLeads, setSelectedLeads] = useState([])
  const [user, setUser] = useState(false);

  socket.on(`sent_dm_${currentUser}`, (data) => {
    console.log('-vvvvvvvvvvvvvv-', data)
  })

  const saveCampaign = () => {
    if (user?.pricing === 'trial') {
      Store.addNotification({
        title: "Error",
        message: "Your account is free trial and limited!",
        type: "danger",
        insert: "top",
        container: "top-left",
        dismiss: {
            duration: 5000,
            onScreen: true
        }
      });
      window.location.href = 'https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]='+currentUser;
      return
    }
    if (currentTwitterUser) {
      if (!currentTwitterUser.isVerified) {
        Store.addNotification({
          title: "Error",
          message: "Your current active twitter account is not verified!",
          type: "danger",
          insert: "top",
          container: "top-left",
          dismiss: {
              duration: 5000,
              onScreen: true
          }
        });
        return
      }
      
      if (originCampaigns[campaignName]?.campaign_leads) {
        Store.addNotification({
          title: "Error",
          message: "Campaign name already exist!",
          type: "danger",
          insert: "top",
          container: "top-left",
          dismiss: {
              duration: 5000,
              onScreen: true
          }
        });
        return
      }
      if (!campaignName) {
        Store.addNotification({
          title: "Error",
          message: "Campaign name is Empty!",
          type: "danger",
          insert: "top",
          container: "top-left",
          dismiss: {
              duration: 5000,
              onScreen: true
          }
        });
        return
      }
      if (!campaignMsg) {
        Store.addNotification({
          title: "Error",
          message: "DM message is Empty!",
          type: "danger",
          insert: "top",
          container: "top-left",
          dismiss: {
              duration: 5000,
              onScreen: true
          }
        });
        return
      }
      if (!selectedLeads?.length) {
        Store.addNotification({
          title: "Error",
          message: "You should select at least one LEAD!",
          type: "danger",
          insert: "top",
          container: "top-left",
          dismiss: {
              duration: 5000,
              onScreen: true
          }
        });
        return
      }

      setIsSaving(true)
      axios({
        method: "POST",
        url: import.meta.env.VITE_API_DOMAIN + "/twitter/campaigns/create",
        data: {
          campaign_name: campaignName,
          campaign_msg: campaignMsg,
          campaign_leads: selectedLeads.join(','),
          current_user: currentUser,
          twitter_user: currentTwitterUser
        }
      }).then((res) => {
        const data = Object.keys(res?.data?.campaigns)
        const temp = []
        for (let i in data) {
          temp[i] = {}
          temp[i]['campaign_name'] = data[i]
          temp[i]['account'] = res.data.campaigns[data[i]].account
          temp[i]['created'] = res.data.campaigns[data[i]].created
          temp[i]['campaign_msg'] = res.data.campaigns[data[i]].campaign_msg
          temp[i]['sent_count'] = res.data.campaigns[data[i]].sent_count
          temp[i]['status'] = res.data.campaigns[data[i]].status
          temp[i]['campaign_leads'] = res.data.campaigns[data[i]].campaign_leads
        }
        setCampaigns(temp)
        setIsSaving(false)
        setShowModal(false)
      }).catch((err) => {
        console.error(err);
      })
    }
  }

  const isSelected = (name) => selectedLeads.indexOf(name) !== -1;

  const checkLeads = (e, name) => {
    const selectedIndex = selectedLeads.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedLeads, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedLeads.slice(1));
    } else if (selectedIndex === selectedLeads.length - 1) {
      newSelected = newSelected.concat(selectedLeads.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedLeads.slice(0, selectedIndex),
        selectedLeads.slice(selectedIndex + 1),
      ); 
    }

    setSelectedLeads(newSelected);
  };

  const runCampaign = (campaign_name) => {
    setIsLoading(true)
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/twitter/campaigns/run",
      data: {
        campaign_name,
        current_user: currentUser,
        twitter_user: currentTwitterUser
      }
    }).then((res) => {
      const data = Object.keys(res?.data?.campaigns)
      const temp = []
      for (let i in data) {
        temp[i] = {}
        temp[i]['campaign_name'] = data[i]
        temp[i]['account'] = res.data.campaigns[data[i]].account
        temp[i]['created'] = res.data.campaigns[data[i]].created
        temp[i]['campaign_msg'] = res.data.campaigns[data[i]].campaign_msg
        temp[i]['sent_count'] = res.data.campaigns[data[i]].sent_count
        temp[i]['status'] = res.data.campaigns[data[i]].status
        temp[i]['campaign_leads'] = res.data.campaigns[data[i]].campaign_leads
      }
      setCampaigns(temp)
      setIsLoading(false)
    }).catch((err) => {
      console.error(err);
      setIsLoading(false)
    })
  }

  const killCampaign = (campaign_name) => {
    setIsLoading(true)
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/twitter/campaigns/kill",
      data: {
        campaign_name,
        current_user: currentUser,
        twitter_user: currentTwitterUser
      }
    }).then((res) => {
      const data = Object.keys(res?.data?.campaigns)
      const temp = []
      for (let i in data) {
        temp[i] = {}
        temp[i]['campaign_name'] = data[i]
        temp[i]['account'] = res.data.campaigns[data[i]].account
        temp[i]['created'] = res.data.campaigns[data[i]].created
        temp[i]['campaign_msg'] = res.data.campaigns[data[i]].campaign_msg
        temp[i]['sent_count'] = res.data.campaigns[data[i]].sent_count
        temp[i]['status'] = res.data.campaigns[data[i]].status
        temp[i]['campaign_leads'] = res.data.campaigns[data[i]].campaign_leads
      }
      setCampaigns(temp)
      setIsLoading(false)
    }).catch((err) => {
      console.error(err);
      setIsLoading(false)
    })
  }

  useEffect(() => {
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/twitter/leads/get",
      data: {
        current_user: currentUser
      }
    }).then((res) => {
      const data = res?.data?.leads
      const temp = []
      for (let i in data) {
        if (data[i]['status'] === 'done') {
          temp.push({
            lead_name: data[i]['lead_name'],
            lead_from: data[i]['lead_from'],
            lead_type: data[i]['lead_type'],
            status: data[i]['status'],
            account: data[i]['account'],
            created: data[i]['created'],
            leads: data[i]['leads']?.length
          })
        }
      }
      setLeads(temp)
    }).catch((err) => {
      console.error(err);
    })
  }, [])

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')))
    setIsLoading(true)
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/twitter/campaigns/get",
      data: {
        current_user: currentUser
      }
    }).then((res) => {
      const data = Object.keys(res?.data?.campaigns)
      setOriginCampaigns(res?.data?.campaigns)
      const temp = []
      for (let i in data) {
        temp[i] = {}
        temp[i]['campaign_name'] = data[i]
        temp[i]['account'] = res.data.campaigns[data[i]].account
        temp[i]['created'] = res.data.campaigns[data[i]].created
        temp[i]['campaign_msg'] = res.data.campaigns[data[i]].campaign_msg
        temp[i]['sent_count'] = res.data.campaigns[data[i]].sent_count
        temp[i]['status'] = res.data.campaigns[data[i]].status
        temp[i]['campaign_leads'] = res.data.campaigns[data[i]].campaign_leads
      }
      setCampaigns(temp)
      setIsLoading(false)
    }).catch((err) => {
      setIsLoading(false)
      console.error(err);
    })
  }, [])
  
  return (
    <Fragment>
      <div className="p-10 w-full space-y-10 flex flex-col justify-start">
        {user?.pricing !== 'trial' ?
          ""
          :
          <div className="flex flex-wrap gap-5 justify-center" style={{color: '#a59733'}}>
          <a href={"https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]="+currentUser} style={{textDecoration: 'underline', color: 'rgb(211 186 11)'}}>UPGRADE TO SEND MESSAGES?</a></div>
        }
        {isLoading &&
          <Box sx={{ display: 'flex', zIndex: 999, position: 'absolute', top: 'calc(50% - 30px)', left: 'calc(50% - 20px)' }}>
            <CircularProgress />
          </Box>
        }
        <div className="flex flex-wrap p-2 justify-end items-right">
          <ModalActivator Name={"Create"} Action={()=> setShowModal(true)}/>
        </div>
        <div className="gap-5 bg-neutral-800/50 min-w-fit h-fit min-h-fit rounded-lg border drop-shadow-xl border-neutral-400/20 p-6 mb-2 flex flex-col justify-start">
          <h2 className="place-self-start text-neutral-500/80 font-medium">
            Twitter Leads
          </h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650, backgroundColor: '#323232' }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Campaign Name</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Leads</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Date Created</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Message Content</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Message Sent</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Status</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((row) => (
                  <TableRow
                    key={row.campaign_name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{row.campaign_name}</TableCell>
                    <TableCell>{row.campaign_leads}</TableCell>
                    <TableCell>{row.created}</TableCell>
                    <TableCell>{row.campaign_msg}</TableCell>
                    <TableCell>{row.sent_count}</TableCell>
                    <TableCell>
                      {(row.status === 'created' || row.status === 'stop' || row.status === undefined) &&
                        <button
                          onClick={() => runCampaign(row.campaign_name)}
                          className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-indigo-500 to-indigo-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                          <FaRocket className="w-5 h-5" />
                        </button>
                      }
                      {row.status === 'run' && 
                        <button
                          onClick={() => killCampaign(row.campaign_name)}
                          className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-red-500 to-red-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                          <BsX className="w-8 h-8" />
                        </button>
                      }
                      {row.status === 'done' && 'Completed'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div style={{height: '600px', width: '450px', padding: '50px 20px'}}>
          {isSaving &&
            <Box sx={{ display: 'flex', position: 'absolute', top: 'calc(50% - 30px)', left: 'calc(50% - 20px)' }}>
              <CircularProgress />
            </Box>
          }
          <Box style={{ marginBottom: 20, width: '100%' }}>
            <TextField style={{ width: '100%' }} label="Campaign Name" variant="outlined" value={campaignName} onChange={(e)=>setCampaignName(e.target.value)} />
          </Box>
          <Divider />
          <TableContainer component={Paper} style={{ margin: '20px 0', minHeight: 200}}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>
                  </TableCell>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Date Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((row) => {
                  const isItemSelected = isSelected(row.lead_name);

                  return (
                    <TableRow
                      key={row.username}
                      onClick={(e) => checkLeads(e, row.lead_name)}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                        />
                      </TableCell>
                      <TableCell>{ row.lead_name }</TableCell>
                      <TableCell>{ row.created }</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box style={{ marginBottom: 0, width: '100%' }}>
            <TextField  style={{ width: '100%' }} id="outlined-basic" label="Message Content" variant="outlined" multiline
          minRows={5} maxRows={5} value={campaignMsg} onChange={(e) => setCampaignMsg(e.target.value)} />
          </Box>
          <div className='flex gap-5 items-end justify-between'>
            <h3 className="text-white/80 text-xl font-semibold"></h3>
            <button onClick={()=>saveCampaign()} className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded text-white font-semibold
                p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80 mt-5">
                Save
              <BsArrowRight className='w-5 h-5' />
            </button>
          </div>
        </div>
      </Dialog>
    </Fragment>
  )
}

export default TwitterCampaigns;
