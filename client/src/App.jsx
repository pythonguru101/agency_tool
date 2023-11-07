import React, { useState, useEffect, Fragment } from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import { AuthProvider } from './components/ProtectedRoutes/AuthContext';
import NoPage from './pages/NoPage';
import Loading from './pages/Loading';
// Pages
import Overview from "./pages/Overview";
import Leads from "./pages/Leads";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Twitter from "./pages/Twitter";
// Components
import Layout from "./components/Layout";

// Import notifications
import { Store } from 'react-notifications-component';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
// Import Axios
import axios from 'axios'
// import decrypter
import { decryptData } from './utils/securityTools'
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_DOMAIN, { transports: ['websocket'] })

const App = () => {
    const [currentUser , setCurrentUser] = useState(null)
    const [loading , setLoading] = useState(true)
    //const [socket, setSocket] = useState(null)
    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => {
        setRefreshTrigger(!refreshTrigger)
    }

    useEffect(() => {
    }, [])

    useEffect(() => {
        if (currentUser) {
            socket.on("error_user_"+currentUser, (error) => {
                console.error(error)
                Store.addNotification({
                    title: "Error",
                    message: error.error,
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                refresh()
            })
            socket.on("task_finished_user_"+currentUser, (data) => {
                Store.addNotification({
                    title: "Finished The Task " + data.name,
                    message: "Finished "+ data.action + " in " + data.location,
                    type: "info",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                refresh()
            })
            socket.on("notification_user_"+currentUser, (data) => {
                Store.addNotification({
                    title: "You have a new notification",
                    message: data.message,
                    type: "success",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                refresh()
            })
            // refresh()
        }
    }, [currentUser])

    const checkAuth = async () => {
        let data = localStorage.getItem('ig')
        if (!data) {
            setCurrentUser(null)
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
            setCurrentUser(null)
            return
        }
        if (userInfo) {
            // Get the email and password from string format to json format
            const { email, password } = JSON.parse(userInfo)
            if (email && password) {
                axios({
                    method: 'POST',
                    url: import.meta.env.VITE_API_DOMAIN + '/users/login',
                    data: {
                        email: email,
                        password: password
                    }
                }).then((res) => {
                    if (res.data.message === "Login Successful") {
                        setCurrentUser(email)
                        const user = res.data.user
                        localStorage.setItem('user', user)
                    } else {
                        localStorage.removeItem('user')
                        setCurrentUser(null)
                    }
                }).catch((err) => {
                    console.error(err)
                    setCurrentUser(null)
                })
            }
        } else {
            setCurrentUser(null)
        }
    }

    useEffect(() => {
        setLoading(true)
        checkAuth()
        setLoading(false)
    }, [])

    return (
        <Fragment>
            <ReactNotifications/>
            <Router>
                {/* Loading page by making it override the page*/}
                {loading && <Loading />}
                <AuthProvider value={{ currentUser, setLoading }}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        {/* Login Sytem */}
                        <Route path="/signin" element={!currentUser?<SignIn />: <Navigate to="/dashboard"/>} />
                        <Route path="/signup" element={!currentUser?<SignUp />: <Navigate to="/dashboard"/>} />
                        <Route path="*" element={<NoPage />} />
                        <Route path="/dashboard" element={currentUser? <Layout/>: <Navigate to="/signin"/>}>
                                <Route index element={<Overview Refresh={refreshTrigger}/>} />
                                <Route path="leads" element={<Leads Refresh={refreshTrigger}/>} />
                                <Route path="campaigns" element={<Campaigns Refresh={refreshTrigger}/>} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="upgrade" element={<Upgrade />} />
                                <Route path="twitter" element={<Twitter />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </Fragment>
    );
}

export default App;
