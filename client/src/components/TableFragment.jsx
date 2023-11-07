import React, { useState, useEffect } from 'react';
// Import a launch icon from react-icons that isn't a bulb
import { FaRocket } from "react-icons/fa";
import StatusFragment from './StatusFragment';
import { Store } from 'react-notifications-component';
// Import X icon
import { BsX } from "react-icons/bs";
import axios from 'axios';
import { useAuthValue } from './ProtectedRoutes/AuthContext';
// Check mark icon
import { AiOutlineCheckCircle } from "react-icons/ai";
// Danger icon like /!\
import { RiErrorWarningLine } from "react-icons/ri";

const Banished = ["ID", "Message", "Leads", "status", "Filters", "Type", "parsedProxies"]

const TableFragment = ({ TableFragmentEls, TriggerRefresh }) => {
    const [state, setState] = useState("ready")
    const [thread, setThread] = useState(TableFragmentEls)
    const [isHovered, setIsHovered] = useState(false);
    const [isFragmentHovered, setIsFragmentHovered] = useState(false);
    const { currentUser } = useAuthValue();
    console.log('-----------', TableFragmentEls)
    useEffect(() => {
        setThread(TableFragmentEls)
    }, [TableFragmentEls])

    useEffect(() => {
        if (TableFragmentEls["status"] === "online") {
            setState("working")
        } else if (TableFragmentEls["status"] === "offline") {
            setState("ready")
        } else if (TableFragmentEls["status"] === "done") {
            setState("done")
        } else if (TableFragmentEls["status"] === "warning") {
            setState("warning")
        }
    }, [TableFragmentEls])

    function renderButton() {
        switch (state) {
            case "ready":
                return (
                    <button
                        onClick={() => launch()} 
                        className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-indigo-500 to-indigo-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                        <FaRocket className="w-5 h-5" />
                    </button>
                )
            case "loading":
                return (
                    // No animation and no onlclick / interaction
                    <button
                        className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-indigo-500 to-indigo-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                        <svg aria-hidden="true" className="w-7 h-7 text-gray-200 animate-spin dark:text-gray-800 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                    </button>
                )
            case "working":
                return (
                    // Make a button that when you hover on it you can kill the process, should be a red button when you hover. And indigo when you don't
                    <button
                        onClick={() => kill()}
                        className=" active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 hover:opacity-80 active:opacity-60 transition bg-gradient-to-b from-red-500 to-red-600 w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium">
                        <BsX className="w-8 h-8" />
                    </button>
                )
            case "done":
                return (
                    // Should be green and mark icon but when hover it should turn into a clickable button that deletes the thread with x icon etc
                    <button
                        onClick={() => kill()}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 ${
                        isHovered ? 'hover:opacity-80 active:opacity-60 bg-red-500' : 'hover:opacity-80 bg-gradient-to-b from-green-500 to-green-600'
                        } w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium transition`}
                    >
                        {isHovered ? <BsX className="w-8 h-8" /> : <AiOutlineCheckCircle className="w-8 h-8" />}
                    </button>
                )
            case "warning":
                return (
                    // Should be the same as done but should instead display a yellow background and a danger icon
                    <button
                        onClick={() => kill()}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`active:translate-y-0.5 hover:drop-shadow-xl hover:-translate-y-0.5 ${
                        isHovered ? 'hover:opacity-80 active:opacity-60 bg-red-500' : 'hover:opacity-80 bg-gradient-to-b from-yellow-500 to-yellow-600'
                        } w-10 h-10 flex justify-center items-center rounded hover:bg-primary-600 rounded-x text-white font-medium transition`}
                    >
                        {isHovered ? <BsX className="w-8 h-8" /> : <RiErrorWarningLine className="w-8 h-8" />}
                    </button>
                )

            default:
                break;
        }
    }


    function kill() {
        // Like launch but opposite and this time we delete the thread
        if (!currentUser || !thread.ID) return
        setState("loading")
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
            // Timeout callback after 15000 milliseconds
            if (state !== "ready") {
                source.cancel("Request timed out."); // Cancel the ongoing request
                // Execute your callback logic here
                console.log("Timeout occurred. No response received within 15000 milliseconds.");
                Store.addNotification({
                    title: "Error!",
                    message: "Killing the thread took too long, please try again later.",
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setState("working")
            }
        }, 10000);

        axios
            .post(import.meta.env.VITE_API_DOMAIN + "/threads/kill", {
                email: currentUser,
                ID: thread.ID,
                cancelToken: source.token // Pass the cancel token to the request config
            })
            .then((res) => {
                clearTimeout(timeout); // Clear the timeout if a response is received within the specified time
                setState("ready");
                Store.addNotification({
                    title: "Thread Killed!",
                    message: "Your thread has been killed successfully!",
                    type: "success",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                    duration: 5000,
                    onScreen: true
                    }
                });
                TriggerRefresh()

            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    // Request was cancelled, no action needed
                    return;
                }

                clearTimeout(timeout); // Clear the timeout if an error occurs
                console.error(err);
                Store.addNotification({
                    title: "Error!",
                    message: "The following error has occurred: " + err.response.data.message,
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                    duration: 5000,
                    onScreen: true
                    }
                });
                setState("working")
                
            }
        );
    }

    const launch = () => {
        if (!currentUser || !thread.ID) return
        setState("loading")
        const source = axios.CancelToken.source();
        
        const timeout = setTimeout(() => {
            // Timeout callback after 15000 milliseconds
            if (state !== "working") {
                source.cancel("Request timed out."); // Cancel the ongoing request
                // Execute your callback logic here
                console.log("Timeout occurred. No response received within 15000 milliseconds.");
                Store.addNotification({
                    title: "Error!",
                    message: "Starting the thread took too long, please try again later.",
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });    
                setState("ready")
                
            }
        }, 10000);

        axios
            .post(import.meta.env.VITE_API_DOMAIN + "/threads/start", {
                email: currentUser,
                ID: thread.ID,
                cancelToken: source.token // Pass the cancel token to the request config
            })
            .then((res) => {
                clearTimeout(timeout); // Clear the timeout if a response is received within the specified time
                setState("working");
                    
                Store.addNotification({
                    title: "Thread Launched!",
                    message: "Your thread has been launched successfully!",
                    type: "success",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                    duration: 5000,
                    onScreen: true
                    }
                });
                TriggerRefresh()
                
            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    // Request was cancelled, no action needed
                    return;
                }

                clearTimeout(timeout); // Clear the timeout if an error occurs
                console.error(err);
                Store.addNotification({
                    title: "Error!",
                    message: "The following error has occurred: " + err.response.data.message,
                    type: "danger",
                    insert: "top",
                    container: "top-left",
                    dismiss: {
                    duration: 5000,
                    onScreen: true
                    }
                });
                setState("ready")
                
            });
    };

    function handleExportThread() {
        let leads = thread.Leads;
        let leadsString = "";
        Object.keys(leads).forEach((username) => {
        leadsString += `${username}\n`;
        });

        // Create a Blob with the data
        const blob = new Blob([leadsString], { type: "text/plain" });

        // Create a URL to the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const tempAnchor = document.createElement("a");
        tempAnchor.href = url;
        tempAnchor.download = "leads.txt"; // Set the filename for the downloaded file

        // Append the anchor to the DOM, click it, and remove it
        document.body.appendChild(tempAnchor);
        tempAnchor.click();
        document.body.removeChild(tempAnchor);

        // Release the URL resource
        URL.revokeObjectURL(url);
    }
    
    return (
        <tr 
            className={`${isFragmentHovered?"cursor-pointer":""} transition duration-300 ${!(state==="working")?"even:bg-neutral-500/5 bg-neutral-900/10":"even:bg-gray-500/5 bg-gray-900/5"} text-neutral-400/80 font-medium border rounded-xl border-neutral-500/20`}
            onMouseEnter={() => state==="done"&&thread.Type==="leads"?setIsFragmentHovered(true):setIsFragmentHovered(false)}
            onMouseLeave={() => setIsFragmentHovered(false)}
            onClick={() => state==="done"&&thread.Type==="leads"?handleExportThread():{}}
            >
            {
                Object.values(thread).map((fragment, index) => (
                    // Don't accept the Banished els as a fragment
                    !Banished.includes(Object.keys(thread)[index]) ? (
                        <td key={index} className="p-4">
                            {/* If the fragment is a status according to the object itself, render a status fragment */}
                            {
                                (Object.keys(thread)[index] === "Status") ? (
                                    <StatusFragment Status={fragment}/>
                                ) : (
                                    fragment
                                )
                            }
                        </td>
                    ) : (null)
                
                ))

            }
            {/* Activate or launch button for the campaign */}
            <td className='mr-2'>
                {
                    renderButton()
                }
            </td>
        </tr>  
    );
}

export default TableFragment;
