import React from 'react';
import { useState } from 'react';
import LeadsModal from './ModalComponents/LeadsModal';
import CampaignsModal from './ModalComponents/CampaignsModal.jsx';
import AccountsModal from './ModalComponents/AccountsModal.jsx';
import ProxiesModal from './ModalComponents/ProxiesModal.jsx';
// X close icon
import axios from 'axios';
import { BsX } from "react-icons/bs";
import { BsArrowRight } from "react-icons/bs";
// Get current user
import { useAuthValue } from './ProtectedRoutes/AuthContext';
import { Navigate } from 'react-router-dom';
import { create_thread, import_proxies } from "../utils/apiCalls";
import { encryptData, decryptData } from '../utils/securityTools';
import { Store } from "react-notifications-component";

const Modal = ({ Type, Activated, Title, Close, TriggerRefresh, Leads }) => {
    const [Data , setData] = useState([])
    const { currentUser } = useAuthValue()
    if (!currentUser) return <Navigate to="/signin" />

    function changeAllThreadsAccount() {
        const activeAccount = GetIGaccountActive()
        if (!activeAccount) return
        axios({
            method: "post",
            url: import.meta.env.VITE_API_URL + "/api/users/threads",
            data: {
                email: currentUser
            }
        }).then((res) => {
            res.data.forEach((thread) => {
                // If send message assignment hen change the account
                if (thread.assignment === "0") {
                    // If the thread is online then kill it
                    if (thread.status === "online") {
                        axios({
                            method: "post",
                            url: import.meta.env.VITE_API_URL + "/api/users/threads/kill",
                            data: {
                                email: currentUser,
                                threadid: thread._id
                            }
                        }).then((res) => {
                        })
                    } else {
                        axios({
                            method: "post",
                            url: import.meta.env.VITE_API_URL + "/api/users/threads/input",
                            data: {
                                username: activeAccount.username,
                                password: activeAccount.password,
                            },
                        }).then((res) => {
                        })
                    }
                }
            })
        })
    }      

    function GetIGaccountActive() {
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
                    if (igaccounts[account].active) return igaccounts[account]
                }
            }
        }
        return false
    }

    // Add handlers to send to the server
    function handleData() {
        // if data is null or empty return else Close and send data to server
        if (!Data) return
        const activeAccount = GetIGaccountActive()
        const user = JSON.parse(localStorage.getItem('user'))
        if (Data.Type === "Leads") {
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
            } else {
                create_thread({
                    email:currentUser,
                    assignment:Data.Filters[0].Type==="Followers"?"2":Data.Filters[0].Type==="Followings"?"4":"3",
                    data:{
                        leadname:Data.LeadName,
                        DateCreated:Date.now(),
                        username:activeAccount.username,
                        password:activeAccount.password,
                        amount:Data.Filters[0].Amount,
                        finished:0,
                        // Add targets => user using filters
                        targets:[Data.Filters[0].Target],
                    },
                    refresh:()=>TriggerRefresh()
                })
            }
        } else if (Data.Type === "Campaigns") {
            if (user?.pricing === 'trial') {
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

                window.location.href = 'https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]='+currentUser;
            } else {
                create_thread({
                    email:currentUser,
                    assignment:"0",
                    data:{
                        campaignname:Data.CampaignName,
                        DateCreated:Date.now(),
                        message:Data.Message,
                        finished:0,
                        username:activeAccount.username,
                        password:activeAccount.password,
                        targets:Data.Targets
                    },
                    refresh:()=>TriggerRefresh()
                })
            }
        } else if (Data.Type === "Proxies") {
            import_proxies({
                email:currentUser,
                proxies:Data.parsedProxies,
            })
        } else if (Data.Type === "Accounts") {
            // Get the data, decryt it, add the accounts, encrypt it and send it back
            let data = localStorage.getItem('ig')
            if (!data) {
                console.error("No data found")
                return
            }
            data = JSON.parse(data)
            let userInfo = decryptData(data.data, `user_${data.id}`)
            if (userInfo === "Error : Invalid key") {
                console.error("Invalid key")
                return
            }
            if (userInfo) {
                // Get the email and password from string format to json format
                const { email, password } = JSON.parse(userInfo)
                if (email && password) {
                    // Get the accounts and add them
                    let accounts = Data.Accounts
                    userInfo = JSON.parse(userInfo)
                    userInfo.igaccounts = accounts
                    const encryptedData = encryptData(JSON.stringify(userInfo), `user_${email}`)
                    localStorage.setItem('ig', JSON.stringify({id:email, data:encryptedData}));
                    window.location.reload(false);
                }
            }

        }
        Close()
    }
    
    if (!Activated) return

    return (
        <div className='fixed inset-0 bg-black p-10 bg-opacity-25 backdrop-blur-sm flex justify-center items-center text-white text-2xl'>
            <div className={`overflow-auto max-h-full w-2/3 h-fit bg-neutral-800/80 rounded-lg border border-neutral-400/20 p-6 flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                    <h3 className="text-white/80 text-xl font-semibold">{Title||"Modal"}</h3>
                    <button onClick={()=>Close()} className="float-right"><BsX className="w-7 h-7" /></button>
                </div>
                <div>
                    {{
                        "Leads":<LeadsModal updateData={(d)=>setData(d)}/>,
                        "Campaigns":<CampaignsModal updateData={(d)=>setData(d)}/>,
                        "Accounts":<AccountsModal updateData={(d)=>setData(d)}/>,
                        "Proxies":<ProxiesModal updateData={(d)=>setData(d)}/>,
                    }[Type||"Leads"]
                    }
                </div>
                <div className='flex gap-5 items-end justify-between'>
                    <h3 className="text-white/80 text-xl font-semibold"></h3>
                    <button onClick={() => handleData()} className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded text-white font-semibold
                        p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80 mt-5">
                        Save
                        <BsArrowRight className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
