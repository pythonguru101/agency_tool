import React, { useState } from 'react';
import axios from 'axios';

// import jwt from 'jsonwebtoken';
// Import notifications
import { Store } from 'react-notifications-component';
import { encryptData } from '../utils/securityTools';
import { Link } from "react-router-dom";

import "../styles/Signup.css"

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [step, setStep] = useState('signup')
    const [premieum, setPremieum] = useState(false)
    const [loading, setLoading] = useState(false);

    const onClickNext = async () => {
        if (email === "" || password === "" || confirmPassword === "") {
            Store.addNotification({
                title: "Error",
                message: "Please fill in all fields",
                type: "danger",
                insert: "top",
                container: "top-left",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return;
        }
        if (password !== confirmPassword) {
            Store.addNotification({
                title: "Error",
                message: "Password is incorrect!",
                type: "danger",
                insert: "top",
                container: "top-left",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return;
        }
        setStep('payment');
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (email === "" || password === "" || confirmPassword === "") {
            Store.addNotification({
                title: "Error",
                message: "Please fill in all fields",
                type: "danger",
                insert: "top",
                container: "top-left",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return;
        }
        if (password !== confirmPassword) {
            Store.addNotification({
                title: "Error",
                message: "Password is incorrect!",
                type: "danger",
                insert: "top",
                container: "top-left",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return;
        }
        setLoading(true);

        await axios({
            method: 'POST',
            url: import.meta.env.VITE_API_DOMAIN + '/users/register',
            data: {
                email: email,
                password: password
            }
        }).then((res) => {
            if (res.data.message === "Internal Sever Error") {
                Store.addNotification({
                    title: "Error",
                    message: res.data.message,
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
            } else {
                Store.addNotification({
                    title: "Success",
                    message: "Now, please setup your payment method!",
                    type: "success",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });

                const data = JSON.stringify({email:email, password:password})
                const encryptedData = encryptData(data, `user_${email}`)
                const user = res.data.user
                localStorage.setItem('user', user)
                localStorage.setItem('ig', JSON.stringify({id:email, data:encryptedData}));
                window.location.href = 'https://agencytool.lemonsqueezy.com/checkout/buy/5a178194-d57e-415f-a5da-fe754a07021a?checkout[email]='+email;
            }
        }).catch((err) => {
            Store.addNotification({
                title: "Error",
                message: err?.response?.data?.message,
                type: "danger",
                insert: "top",
                container: "top-left",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        })
    }        

    return (
            <>
                {/*
                This example requires updating your template:

                ```
                <html class="h-full bg-gray-900">
                <body class="h-full">
                ```
                */}
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 h-screen">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <a href="https://agencytool.io/">
                        <img
                            className="mx-auto h-20 w-auto rounded bg-indigo-700"
                            src="https://cdn.discordapp.com/attachments/1122198270983290991/1127996690503315476/ap4.png"
                            alt="Your Company"
                        />
                    </a>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Sign in to your account
                    </h2>
                </div>
                {step === 'payment' &&
                    <div className="cards flex flex-row justify-between mt-10 sm:mx-auto">
                        <div className="card-container" onClick={()=>setPremieum(false)}>
                            <div className={`card-title ${!premieum && 'active'}`}>Free Trial</div>
                            <div className={`card-content ${!premieum && 'active'}`}>
                                <span className='content-title'>3 Days Free Trial</span>
                                <span>Automated Messaging</span>
                                <span>Lead Generation</span>
                                <span>Automated Followups</span>
                                <span>Unlimited Sending Accounts</span>
                                <span>Message Personalization</span>
                                <span>Unlimited Messages</span>
                                <span>Sophisticated Data analysis </span>
                                <span>Auto Comment & Story Like</span>
                                <span>Cold DM Mastery & Training Course</span>
                            </div>
                        </div>
                        <div className="card-container" onClick={()=>setPremieum(true)}>
                            <div className={`card-title ${premieum && 'active'}`}>Premium</div>
                            <div className={`card-content ${premieum && 'active'}`}>
                                <span className='content-title'>$54 per month</span>
                                <span>Automated Messaging</span>
                                <span>Lead Generation</span>
                                <span>Automated Followups</span>
                                <span>Unlimited Sending Accounts</span>
                                <span>Message Personalization</span>
                                <span>Unlimited Messages</span>
                                <span>Sophisticated Data analysis </span>
                                <span>Auto Comment & Story Like</span>
                                <span>Cold DM Mastery & Training Course</span>
                            </div>
                        </div>
                    </div>
                }

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    {step === 'signup' &&
                        <form className="space-y-6" action="#" method="POST">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                Email address
                                </label>
                                <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                    Password
                                </label>
                                </div>
                                <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                    Confirm Password
                                </label>
                                </div>
                                <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                                </div>
                            </div>
                        </form>
                    }

                    <div className='btn-container'>
                        {step === 'payment' &&
                            <button
                                onClick={(e) => onClickNext()}
                                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Next
                            </button>
                        }
                        {step === 'signup' &&
                            <button
                                onClick={(e) => handleSubmit(e)}
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Sign Up
                            </button>
                        }
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
                        Sign In
                    </Link>
                    </p>
                </div>
                </div>
            </>
        )
}
