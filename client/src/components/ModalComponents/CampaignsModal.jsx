import { useState, useEffect } from 'react';
import axios from 'axios';
// get user
import { useAuthValue } from "../ProtectedRoutes/AuthContext";

const CampaignsModal = ({ updateData }) => {
    const [Message, setMessage] = useState("")
    // This is the pattern of the leads => {index:x:integer, name:y:string, selected:z:boolean}
    const [CampaignName, setCampaignName] = useState("Default Campaign Name")
    const [Leads, setLeads] = useState([])
    const { currentUser } = useAuthValue();

    // Get the threads from the server and finds the ones related to leads so we can include them in the leads
    useEffect(() => {
        axios({
            method: "POST",
            url: import.meta.env.VITE_API_DOMAIN + "/users/threads",    
            data: {
                email:currentUser,
            }
        }).then((res) => {
            const threads = res.data.data;
            let leads = [];
            for (const thread in threads) {
                // get only the name and the result fro mthe threads
                const { leadname, result, finished } = threads[thread].data;
                if (!leadname || !result || !finished ) continue;
                leads.push({
                    index:leads.length,
                    name:leadname,
                    targets:result,
                    selected:false
                })
            }
            setLeads(leads);
        }).catch((err) => {
            console.error(err);
        })
    }, [currentUser]);

    useEffect(() => {
        // Get only selected ones
        let selectedLeads = Leads.filter((lead) => lead.selected);
        // Combine all the objects into one
        let combinedLeads = {};
        selectedLeads.forEach((lead) => {
            combinedLeads = {...combinedLeads, ...lead.targets}
        })
        updateData({Type:"Campaigns", CampaignName:CampaignName!==""?CampaignName:"Default Campaign Name", Message:Message, Targets:combinedLeads})
    }, [Message, Leads, CampaignName]);

    return (
        <div className='my-5 space-y-5'>
            <div className='flex gap-5 justify-center items-center '>
                <h2 className='text-white/70 font-bold'>Campaign Name</h2>
                <input type="text" value={CampaignName} onChange={(e) => {setCampaignName(e.target.value)}} className='p-4 text-xl h-10 w-1/2 rounded bg-neutral-600 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl'/>
            </div>
            <div className='p-2 w-full bg-neutral-700/50 rounded-xl flex flex-col border-neutral-500/50 border space-y-2'>
                {
                    Leads.length === 0 ? <h2 className='text-white/70 font-bold text-center'>No Lead Found</h2> :
                    Leads.map(({i, name, selected}, index) => {
                        return <div
                            onClick={() => {
                                let newLeads = [...Leads];
                                newLeads[index].selected = !newLeads[index].selected;
                                setLeads(newLeads);
                            }}
                            className={`${selected?'border-indigo-500':'border-neutral-500'} text-xl flex justify-center items-center font-semibold drop-shadow-xl border text-white/60 p-4 rounded bg-neutral-900/50 hover:bg-neutral-800/70 transition duration-300 cursor-pointer`}
                            key={index}><span>{name}</span></div>
                    })
                }
            </div>
            <div className='w-full'>
                {/* <div>
                    
                </div> */}
                <input type="text" value={Message} onChange={(e) => setMessage(e.target.value)}
                className='font-semibold placeholder:text-white/50 w-full rounded p-3 text-lg bg-neutral-900 border-neutral-500/50 border outline-none' 
                placeholder="Hello, I'm looking for..." />
            </div>
        </div>
    );
}

export default CampaignsModal;
