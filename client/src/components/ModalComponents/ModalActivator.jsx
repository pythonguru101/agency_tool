import { useState } from 'react';

const ModalActivator = ({ Name, Action }) => {

    return (
        <div>
            <button 
                onClick={()=>Action()}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded text-white font-semibold
                    p-2.5 w-32 min-w-fit whitespace-nowrap transition duration-400 hover:shadow-lg">
                {Name||"Activate"}
            </button>
        </div>
    );
}

export default ModalActivator;
