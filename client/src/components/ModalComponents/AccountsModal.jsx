import { useState, useEffect } from 'react';
import { Store } from 'react-notifications-component';
import { decryptData } from '../../utils/securityTools';
import { random_int } from '../../utils/funcTools';
import axios from 'axios';

const AccountsModal = ({ updateData }) => {
    const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [AccountUsername, setAccountName] = useState("");
    const [AccountPassword, setAccountPassword] = useState("");
    const [Accounts, setAccounts] = useState([])    

    function addAccount(account) {
        setAccounts([...Accounts, {id:random_int(), ...account, active:false, verified: false}])
    }

    function getAccountsFromStorage() {
        let data = localStorage.getItem('ig')
        if (!data) {
            return
        }
        data = JSON.parse(data)
        const userInfo = decryptData(data.data, `user_${data.id}`)
        if (userInfo === "Error : Invalid key") {
            Store.addNotification({
                title: "Error",
                message: "Invalid Key",
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
        if (userInfo) {
            // Get the email and password from string format to json format
            const { igaccounts } = JSON.parse(userInfo)
            if (igaccounts) {
                setAccounts(igaccounts)
            }
        }
    }

    useEffect(() => {
        getAccountsFromStorage()
    }, [])

    useEffect(() => {
        // If None in the accounts is active, then update the data to be empty
        if (Accounts.filter((account) => account.active).length === 0) {
            updateData()
            return;
        }
        updateData({Accounts, Type:"Accounts"})
    }, [Accounts])

    function deleteAccount(id) {
        setAccounts(Accounts.filter((account) => account.id !== id))
    }

    function switchAccount(id) {
        setAccounts(Accounts.map((account) => {
            if (account.id === id) {
                account.active = true;
            } else {
                account.active = false;
            }
            return account;
        }))
    }
    const verifyAccount = (id) => {
        const account = Accounts.filter((account) => account.id === id)[0]

        axios({
            method: "post",
            url: import.meta.env.VITE_API_DOMAIN + "/users/verify-ig",
            data: {
                account
            }
        }).then((res) => {
            console.log(res.data);
            if (res.data?.message == 'success') {
                setAccounts(Accounts.map((account) => {
                    if (account.id === id) {
                        account.verified = true;
                    }
                    return account;
                }))
            } else {
                Store.addNotification({
                    title: "Error",
                    message: "Verification failed",
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
            }
        })
    }

    return (
        <div className="flex flex-col items-between ">
            <div className='p-5 flex flex-col gap-5'>
                <h3 
                    onClick={() => setShowAddAccount(true)}
                    className="m-5 text-lg font-semibold cursor-pointer opacity-70 hover:opacity-40 transition">
                Add Account</h3>
                {Accounts.map((account) => (
                <div key={account.id} className="flex flex-wrap gap-5 justify-between items-center">
                    <div className="flex gap-5 items-center">
                        {/* <img src={account.profile} alt="profile" className="w-12 h-12 rounded-full" /> */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold">{account.username}</h3>
                            <p className="text-sm font-semibold text-green-500">{account.active?"Active Account":""}</p>
                        </div>
                    </div>
                    <div className="flex gap-5 flex-wrap">
                        {account.active ?
                            <span className="p-1.5 gap-3 text-lg font-semibold">Active</span>
                            :
                            <button
                                onClick={() => switchAccount(account.id)} 
                                className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                                p-1.5 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                                Switch
                            </button>
                        }
                        {account.verified ?
                            <span className="p-1.5 gap-3 text-lg font-semibold">Verified</span>
                            :
                            <button
                                onClick={() => verifyAccount(account.id)} 
                                className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                                p-1.5 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                                Verify
                            </button>
                        }
                        <button
                            onClick={() => {setShowAreYouSure(true); setCurrentIndex(account.id)}}
                            className="bg-gradient-to-r from-red-500 to-red-600 rounded text-white font-semibold
                            p-1.5 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                            Delete
                        </button>
                        {showAreYouSure ? (
                            <div className="fixed inset-0 bg-black p-10 bg-opacity-25 flex justify-center items-center text-white text-2xl">
                                <div className="border border-neutral-700 bg-neutral-800 p-10 rounded-lg flex flex-col gap-5">
                                    <h3 className="text-3xl font-semibold">Are you sure?</h3>
                                    <p className="text-lg font-medium">This action cannot be undone.</p>
                                    <div className="flex gap-5">
                                        <button
                                            onClick={() => setShowAreYouSure(false)}
                                            className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                                            p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {deleteAccount(currentIndex); setShowAreYouSure(false)}}
                                            className="bg-gradient-to-r from-red-500 to-red-600 rounded text-white font-semibold
                                            p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (null
                
                        )}
                    </div>
                </div>
                ))}
            </div>
            {/* Add Account */}
            {showAddAccount ? (
                <div className="fixed inset-0 bg-black p-10 bg-opacity-25 flex justify-center items-center text-white text-2xl">
                    <div className="border border-neutral-700 bg-neutral-800 p-10 rounded-lg flex flex-col gap-5">
                        <h3 className="text-3xl font-semibold">Add Account</h3>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="Username" className="text-lg font-semibold">Username</label>
                                <input value={AccountUsername} onChange={(e) => setAccountName(e.target.value)} type="text" id="Username" className="p-2 rounded-lg bg-neutral-700 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl"/> 
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="Password" className="text-lg font-semibold">Password</label>
                                <input value={AccountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" id="Password" className="p-2 rounded-lg bg-neutral-700 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl"/>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <button
                                onClick={() => setShowAddAccount(false)}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 rounded text-white font-semibold
                                p-1.5 w-32 min-w-fit h-fit flex justify-center items-center gap-3 text-lg transition duration-400 hover:shadow-lg hover:opacity-80">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (AccountUsername!=="" && AccountPassword!=="") {
                                        setShowAddAccount(false) 
                                        addAccount({username:AccountUsername, password:AccountPassword})
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
        </div>
    );
}

export default AccountsModal;
