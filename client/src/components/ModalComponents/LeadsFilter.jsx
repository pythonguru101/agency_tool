import { useEffect, useState } from 'react';
import DropdownMenu from '../DropDown';
// X icon

const LeadsFilter = ({ index, filter, updateFilters }) => {
    const [error, setError] = useState(false);
    const [Type, setType] = useState("Followers");
    const [nbFollowers, setFollowers] = useState(0);
    const [nbFollowings, setFollowings] = useState(0);
    const [Hashtag, setHashtag] = useState("");
    const [User, setUser] = useState("");

    // Update the Filter
    useEffect(() => {
        updateFilters(index, {
            index:index,
            Type: Type,
            Amount: nbFollowers || nbFollowings || 5,
            Target: Hashtag.replace("#", "").replace(" ", "") || User.replace(" ", ""),
        });
    }, [Type, nbFollowers, nbFollowings, Hashtag, User]);

    useEffect(() => {
        setFollowers(0);
        setFollowings(0);
        setHashtag("");
        setUser("");
    }, [Type]);

    function isNumber (value) {
        return !isNaN(Number(value));
    }

    function handleInput (e, changer, shouldbeNumber = false) {
        setError(false);
        if (shouldbeNumber) {
            if (isNumber(e.target.value) && Number(e.target.value) <= 1000) {
                changer(Number(e.target.value));
            } else {
                setError(true);
            }
        } else {
            changer(e.target.value);
        }
    }

    return (
        <div className='bg-neutral-800/90 rounded-xl p-5 border min-w-fit h-fit border-neutral-600/50'>
            <div className='flex gap-5 items-center justify-between'>
                {/* Drop Down */}
                <DropdownMenu change={setType} />
                {/* <BsX onClick={()=>{removeFilter(index)}} className="min-w-fit min-h-fit w-8 h-8" /> */}
            </div>
            {error?<h3 className='text-red-400 text-lg font-semibold'>ERROR: A problem occured here, please check the values written. Use numbers & it should be lower than 1k</h3>:""}
            <div>
                {{
                    "Followers": (<div className='flex flex-wrap items-center gap-2'>
                        <h2 className='text-white/60 text-lg font-semibold'>Number Of Followers Is About</h2>
                        <input type="text" onChange={(e)=>handleInput(e, setFollowers, true)} value={nbFollowers} placeholder="1000" className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none" />
                        <h2 className='text-white/60 text-lg font-semibold'>Retrieve Followers from User</h2>
                        <input type="text" onChange={(e)=>handleInput(e, setUser, false)} value={User} placeholder="Red0bsi" className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none"/>
                    </div>),
                    "Followings": (<div className='flex flex-wrap items-center gap-2'>
                        <h2 className='text-white/60 text-lg font-semibold'>Number Of Followings Is About</h2>
                        <input type="text" onChange={(e)=>handleInput(e, setFollowings, true)} value={nbFollowings} placeholder="1000" className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none" />
                        <h2 className='text-white/60 text-lg font-semibold'>Retrieve Followings from User</h2>
                        <input type="text" onChange={(e)=>handleInput(e, setUser, false)} value={User} placeholder="Red0bsi" className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none"/>
                    </div>),
                    "Hashtags": (<div className='flex flex-wrap items-center gap-2'>
                        <h2 className='text-white/60 text-lg font-semibold'>Number Of Followers Is About</h2>
                        <input type="text" placeholder="1000" value={nbFollowers} onChange={(e)=>handleInput(e, setFollowers, true)} className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none" />
                        <h2 className='text-white/60 text-lg font-semibold'>Retrieve people from the Hashtag</h2>
                        <input type="text" placeholder="#Business" value={Hashtag} onChange={(e)=>handleInput(e, setHashtag, false)} className="rounded bg-neutral-700 placeholder:text-white/70 p-2 w-36 text-xl outline-none"/>
                    </div>),
                }[Type]
                }
            </div>
        </div>
    );
}

export default LeadsFilter;
