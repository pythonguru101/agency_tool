import React from 'react';

const SelectedComponent = ({ Name, Activated, activate }) => {
    return (
        <button onClick={() => activate()} className={`drop-shadow-2xl p-1.5 w-32 min-w-fit transition duration-400 ${Activated ? "bg-gradient-to-r from-indigo-500 to-indigo-600 rounded text-white" : "text-neutral-500/75 hover:text-white"} font-semibold`}>
            {Name}
        </button>
    );
}

export default SelectedComponent;
