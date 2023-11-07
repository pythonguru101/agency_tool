import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { BsArrowRight } from "react-icons/bs";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import TableInfoComponent from "../components/TableInfoComponent";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import { decryptData } from "../utils/securityTools";
import { Store } from "react-notifications-component";
import { getCurrentTwitterUser } from "../utils/funcTools";

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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { FaRocket } from "react-icons/fa";

function TwitterLeads({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [Leads, setLeads] = useState([]);
  const { currentUser } = useAuthValue();

  const currentTwitterUser = getCurrentTwitterUser();
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [leadName, setLeadName] = useState('')
  const [leadLimit, setLeadLimit] = useState('')
  const [leadFrom, setLeadFrom] = useState('')
  const [leadType, setLeadType] = useState('followers')

  const saveLead = () => {
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
      const found = Leads.find((e) => e.lead_name == leadName);
      if (found && found?.lead_name == leadName) {
        Store.addNotification({
          title: "Error",
          message: "Same Lead Name already exist!",
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
      const user = JSON.parse(localStorage.getItem('user'))

      if (Leads?.length > 1 && user?.pricing === 'trial') {
        Store.addNotification({
          title: "Error",
          message: "Sorry! Your account is free trial and limited. Please upgrade to Premium!",
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
        url: import.meta.env.VITE_API_DOMAIN + "/twitter/leads/create",
        data: {
          lead_name: leadName,
          lead_limit: leadLimit,
          lead_type: leadType,
          lead_from: leadFrom,
          current_user: currentUser,
          twitter_user: currentTwitterUser
        }
      }).then((res) => {
        const data = res?.data?.leads
        const temp = []
        for (let i in data) {
          temp[i] = {}
          temp[i]['lead_name'] = data[i]['lead_name']
          temp[i]['lead_from'] = data[i]['lead_from']
          temp[i]['lead_type'] = data[i]['lead_type']
          temp[i]['status'] = data[i]['status']
          temp[i]['account'] = data[i]['account']
          temp[i]['created'] = data[i]['created']
          temp[i]['leads'] = data[i]['leads']?.length
        }
        setLeads(temp)
        setIsSaving(false)
        setShowModal(false)
      }).catch((err) => {
        console.error(err);
      })
    } else {
      Store.addNotification({
        title: "Error",
        message: "Please select or add a Twitter account",
        type: "danger",
        insert: "top",
        container: "top-left",
        dismiss: {
            duration: 5000,
            onScreen: true
        }
      });
    }
  }

  const runLead = (lead_name) => {
    setIsLoading(true)
    axios({
      method: "POST",
      url: import.meta.env.VITE_API_DOMAIN + "/twitter/leads/run",
      data: {
        lead_name,
        current_user: currentUser,
        twitter_user: currentTwitterUser
      }
    }).then((res) => {
      const data = res?.data?.leads
      const temp = []
      for (let i in data) {
        temp[i] = {}
        temp[i]['lead_name'] = data[i]['lead_name']
        temp[i]['lead_from'] = data[i]['lead_from']
        temp[i]['lead_type'] = data[i]['lead_type']
        temp[i]['status'] = data[i]['status']
        temp[i]['account'] = data[i]['account']
        temp[i]['created'] = data[i]['created']
        temp[i]['leads'] = data[i]['leads']?.length
      }
      setLeads(temp)
      setIsLoading(false)
    }).catch((err) => {
      console.error(err);
      setIsLoading(false)
    })
  }

  useEffect(() => {
    setIsLoading(true);
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
        temp[i] = {}
        temp[i]['lead_name'] = data[i]['lead_name']
        temp[i]['lead_from'] = data[i]['lead_from']
        temp[i]['lead_type'] = data[i]['lead_type']
        temp[i]['status'] = data[i]['status']
        temp[i]['account'] = data[i]['account']
        temp[i]['created'] = data[i]['created']
        temp[i]['leads'] = data[i]['leads']?.length
      }
      setLeads(temp)
      setIsLoading(false)
    }).catch((err) => {
      setIsLoading(false)
      console.error(err);
    })
  }, [])
  
  return (
    <Fragment>
      <div className="p-10 w-full space-y-10 flex flex-col justify-start">
        {isLoading &&
          <Box sx={{ display: 'flex', zIndex: 999 , position: 'absolute', top: 'calc(50% - 30px)', left: 'calc(50% - 20px)' }}>
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
            <Table sx={{ minWidth: 650, backgroundColor: '#323232' }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>User Account</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Lead Name</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Lead From</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Lead Type</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Date Created</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Status</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Head Count</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Leads.map((row) => (
                  <TableRow
                    key={row.account}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.account}
                    </TableCell>
                    <TableCell>{row.lead_name}</TableCell>
                    <TableCell>{row.lead_from}</TableCell>
                    <TableCell>{row.lead_type}</TableCell>
                    <TableCell>{row.created}</TableCell>
                    <TableCell>
                      {(row.status === 'created' || row.status === undefined) &&
                        <button
                          onClick={() => runLead(row.lead_name)}
                          className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-indigo-500 to-indigo-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                          <FaRocket className="w-5 h-5" />
                        </button>
                      }
                      {row.status === 'run' && 'In Progress'}
                      {row.status === 'done' && 'Completed'}
                    </TableCell>
                    <TableCell>{row.leads}</TableCell>
                    <TableCell></TableCell>
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
        <div style={{height: '400px', width: '400px', padding: '50px 20px'}}>
          {isSaving &&
            <Box sx={{ display: 'flex', position: 'absolute', top: 'calc(50% - 30px)', left: 'calc(50% - 20px)' }}>
              <CircularProgress />
            </Box>
          }
          <Box style={{ marginBottom: 20, width: '100%' }}>
            <TextField style={{width: '100%'}} label="Lead Name" variant="outlined" value={leadName} onChange={(e)=>setLeadName(e.target.value)} />
          </Box>
          <Divider />
          {/*<Box style={{ marginBottom: 20, marginTop: 20, width: '100%' }}>
            <TextField style={{width: '100%'}} label="Leads Limit Number" variant="outlined" value={leadLimit} onChange={(e) => setLeadLimit(e.target.value)} />
                </Box>*/}
          <Box style={{ marginBottom: 20, width: '100%' }}>
            <TextField style={{width: '100%'}} label="Leads From" variant="outlined" value={leadFrom} onChange={(e) => setLeadFrom(e.target.value)} />
          </Box>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={leadType}
            label="Followers"
            style={{ marginTop: 10, width: '100%' }}
          >
            <MenuItem value={'followers'} onClick={() => setLeadType('followers')}>Followers</MenuItem>
            <MenuItem value={'followings'} onClick={() => setLeadType('followings')}>Followings</MenuItem>
          </Select>
          <div className='flex gap-5 items-end justify-between'>
            <h3 className="text-white/80 text-xl font-semibold"></h3>
            <button onClick={()=>saveLead()} className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded text-white font-semibold
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

export default TwitterLeads;
