import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import ModalActivator from "../components/ModalComponents/ModalActivator";
import { useAuthValue } from "../components/ProtectedRoutes/AuthContext";
import { decryptData } from "../utils/securityTools";
import { Store } from "react-notifications-component";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

function TwitterAccounts({ Refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("All");
  const [accounts, setAccounts] = useState([]);
  const [isSaving, setIsSaving] = useState(false)
  const { currentUser } = useAuthValue();

  const [AccountUsername, setAccountName] = useState("");
  const [AccountEmail, setAccountEmail] = useState("");
  const [AccountPassword, setAccountPassword] = useState("");

  const addAccount = (data) => {
    let cooks = localStorage.getItem('twitter')

    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    
    if (cooks.length) {
      cooks.push(data)
    } else {
      cooks.push({...data, isActive: true})
    }
    setAccounts(cooks)
    localStorage.setItem('twitter', JSON.stringify(cooks))
  }

  const verifyAccount = (useremail) => {
    let cooks = localStorage.getItem('twitter')
    let userIndex = 0
    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    let user = {}
    
    for (let i in cooks) {
      console.log('++++++++++++++', useremail, cooks[i].useremail)
      if (cooks[i].useremail === useremail) {
        user = cooks[i]
        userIndex = i
        break;
      } else {
        user = false
      }
    }
    console.log('______________________', user)
    if (!user) {
      Store.addNotification({
        title: "Error",
        message: "Fatal Error",
        type: "danger",
        insert: "top",
        container: "top-left",
        dismiss: {
          duration: 5000,
          onScreen: true
        }
      });
    } else {
      setIsSaving(true)
      axios({
        method: "POST",
        url: import.meta.env.VITE_API_DOMAIN + "/twitter/accounts/verify",
        data: {
          current_user: currentUser,
          twitter_user: user
        }
      }).then((res) => {
        setIsSaving(false)
        if (res.data?.result) {
          cooks[userIndex].isVerified = true
          setAccounts(cooks)
          localStorage.setItem('twitter', JSON.stringify(cooks))
          Store.addNotification({
            title: "Success",
            message: "Twitter credential is verified successfully!",
            type: "success",
            insert: "top",
            container: "top-left",
            dismiss: {
                duration: 5000,
                onScreen: true
            }
          });
          
        } else {
          cooks[userIndex].isVerified = false
          localStorage.setItem('twitter', JSON.stringify(cooks))
          Store.addNotification({
            title: "Error",
            message: "Your twitter credential is wrong! Please check again!",
            type: "danger",
            insert: "top",
            container: "top-left",
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });
        }
      }).catch((err) => {
        console.error(err);
      })
    }
  }

  const switchAccount = (useremail) => {
    let cooks = localStorage.getItem('twitter')

    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    
    for (let i in cooks) {
      if (cooks[i].useremail === useremail) {
        cooks[i].isActive = true
      } else {
        cooks[i].isActive = false
      }
    }
    setAccounts(cooks)
    localStorage.setItem('twitter', JSON.stringify(cooks))
  }

  const deleteAccount = (useremail) => {
    let cooks = localStorage.getItem('twitter')
    let index = -1
    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    
    for (let i in cooks) {
      if (cooks[i].useremail === useremail) {
        index = i
      }
    }
    if (index > -1) {
      cooks.splice(index, 1);
    }

    setAccounts(cooks)
    localStorage.setItem('twitter', JSON.stringify(cooks))
  }

  useEffect(() => {
    let cooks = localStorage.getItem('twitter')

    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    
    setAccounts(cooks)
  }, [])
  
  return (
    <Fragment>
      <div className="p-10 w-full space-y-10 flex flex-col justify-start">
        <div className="flex flex-wrap p-2 justify-end items-right">
          <ModalActivator Name={"Add an account"} Action={()=> setShowModal(true)}/>
        </div>
        <div className="gap-5 bg-neutral-800/50 min-w-fit h-fit min-h-fit rounded-lg border drop-shadow-xl border-neutral-400/20 p-6 mb-2 flex flex-col justify-start">
          {isSaving &&
            <Box sx={{ display: 'flex', position: 'absolute', top: 'calc(50% - 30px)', left: 'calc(50% - 20px)' }}>
              <CircularProgress />
            </Box>
          }
          <h2 className="place-self-start text-neutral-500/80 font-medium">
            Twitter Accounts (Account verification will take for only a few mins)
          </h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650, backgroundColor: '#323232' }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Twitter Email</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Twitter Username</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Add Date</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Is Active</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}>Is Verified</TableCell>
                  <TableCell style={{ color: 'rgb(115 115 115 / 0.8)' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((row) => (
                  <TableRow
                    key={row.username}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.useremail}
                    </TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.addDate}</TableCell>
                    <TableCell>
                      {
                        row.isActive ?
                        'Yes'
                        :
                        <button
                          onClick={() => switchAccount(row.useremail)} 
                          className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                          p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                          Set Active
                        </button>
                      }
                    </TableCell>
                    <TableCell>
                      {
                        row.isVerified ?
                        'Yes'
                        :
                        <button
                          onClick={() => verifyAccount(row.useremail)} 
                          className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                          p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                          Verify
                        </button>
                      }
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={()=>deleteAccount(row.useremail)}
                        className="bg-gradient-to-r from-red-500 to-red-600 rounded text-white font-semibold
                        p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      {showModal ? (
        <div className="fixed inset-0 bg-black p-10 bg-opacity-25 flex justify-center items-center text-white text-2xl">
          <div className="border border-neutral-700 bg-neutral-800 p-10 rounded-lg flex flex-col gap-5">
            <h3 className="text-3xl font-semibold">Add Account</h3>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="Email" className="text-lg font-semibold">Twitter Email</label>
                    <input value={AccountEmail} onChange={(e) => setAccountEmail(e.target.value)} type="email" id="email" className="p-2 rounded-lg bg-neutral-700 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="Password" className="text-lg font-semibold">Password</label>
                    <input value={AccountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" id="Password" className="p-2 rounded-lg bg-neutral-700 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="Username" className="text-lg font-semibold">Twitter Username</label>
                    <input value={AccountUsername} onChange={(e) => setAccountName(e.target.value)} type="text" id="Username" className="p-2 rounded-lg bg-neutral-700 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl"/> 
                </div>
            </div>
            <div className="flex gap-5">
                <button
                    onClick={() => setShowModal(false)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                    p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                    Cancel
                </button>
                <button
                    onClick={() => {
                        if (AccountUsername!=="" && AccountPassword!=="") {
                          setShowModal(false) 
                          addAccount({username: AccountUsername, useremail: AccountEmail, addDate: new Date().toJSON().slice(0, 10), status: '0', isActive: false, isVerified: false, password: AccountPassword})
                        } else {
                          Store.addNotification({
                            title: "Error",
                            message: "Please fill the fields",
                            type: "danger",
                            insert: "top",
                            container: "top-left",
                            dismiss: {
                              duration: 5000,
                              onScreen: true
                            }
                          });
                        }
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded text-white font-semibold
                    p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                    Add
                </button>
            </div>
          </div>
        </div>
      ) : (null)}
    </Fragment>
  )
}

export default TwitterAccounts;
