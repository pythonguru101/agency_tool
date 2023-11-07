import { useState } from 'react';

const DropdownMenu = ({ change }) => {
    const [selectedOption, setSelectedOption] = useState('');

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
        change(event.target.value);
    };

    return (
    <div className='items-center flex gap-5'>
        <label htmlFor="dropdown" className="font-bold text-2xl">Type</label>
        <select id="dropdown" className="rounded bg-neutral-700/50 py-1 px-4 outline-none gap-5 text-white/80 font-semibold" value={selectedOption} onChange={handleOptionChange}>
            <option className="m-6 hover:text-blue-600 font-medium bg-neutral-700 outline-none" value="Followers">Followers</option>
            <option className="m-6 font-medium bg-neutral-700 outline-none" value="Hashtags">Hashtags</option>
            <option className="m-6 font-medium bg-neutral-700 outline-none" value="Followings">Followings</option>
        </select>
    </div>
    );
    };

export default DropdownMenu;