import { useEffect, useState} from 'react';
import { FaPlus } from "react-icons/fa";
import LeadsFilter from './LeadsFilter';

const LeadsModal = ({ updateData }) => {
    // Object representing the filters
    const [Filters, setFilters] = useState([
        {
            index:0,
            Type: "Followers",
            nbFollowers: 0,
            nbFollowings: 0,
            Hashtag: 0,
            User: "",
        },
    ]);
    const [LeadName, setLeadName] = useState("Default Lead Name");

    useEffect(() => {
        // Give default value if it's "" or 0
        let newFilters = [...Filters];
        newFilters.forEach((filter) => {
            if (filter.nbFollowers === 0) filter.nbFollowers = 100;
            if (filter.nbFollowings === 0) filter.nbFollowings = 100;
            if (filter.Hashtag === "") filter.Hashtag = "#Business";
            if (filter.User === "") filter.User = "elonmusk";
        });
        setFilters(newFilters);
    }, []);

    useEffect(() => {
        updateData({LeadName:LeadName!==""?LeadName:"Default Lead Name", Filters:Filters, Type:"Leads"});
    }, [Filters, LeadName]);

    // Update the filters
    const updateFilters = (index, filter) => {
        let newFilters = [...Filters];
        newFilters[index] = filter;
        setFilters(newFilters);
    }



    return (
        <div>
            <div className='flex gap-5 justify-center items-center '>
                <h2 className='text-white/70 font-bold'>Lead Name</h2>
                <input type="text" value={LeadName} onChange={(e) => {setLeadName(e.target.value)}} className='p-4 text-xl h-10 w-1/2 rounded bg-neutral-600 text-white/80 outline-none transition duration-300 focus:drop-shadow-xl'/>
            </div>
            <div className='flex items-center gap-5 m-2'>
                <div className='h-1 w-full bg-neutral-600 rounded'></div>
            </div>
            <div className=' max-h-full h-75 space-y-5 overflow-auto'>
                {
                    Filters.map((filter, index) => {
                        return (
                            <LeadsFilter key={index} index={index} filter={filter} updateFilters={updateFilters} />
                        );
                    }
                    )
                }
            </div>
        </div>
    );
}

export default LeadsModal;
