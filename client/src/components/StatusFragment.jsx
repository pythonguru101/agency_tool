import React from 'react';

const StatusFragment = ({ Status }) => {
    // status name and then the color of the status
    const Statuses = {
        New: "bg-gradient-to-r from-green-500 to-green-600",
        Qualified: "bg-gradient-to-r from-indigo-500 to-indigo-600" ,
        Old: "bg-gradient-to-r from-red-500 to-red-600",
        Pending: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        Active:"bg-gradient-to-r from-green-500 to-green-600",
        Inactive: "bg-gradient-to-r from-gray-500 to-gray-600",
        // Not green
        Done: "bg-gradient-to-r from-violet-500 to-violet-600",
    }

    return (
        <div>
            {
                Statuses[Status] ? (
                    <div className={`drop-shadow rounded w-20 h-6 flex min-w-fit justify-center items-center ${Statuses[Status]}`}>
                        <p className="text-white font-semibold text-sm">{Status}</p>
                    </div>
                ) : (
                    <div className="rounded w-20 h-6 flex justify-center min-w-fit items-center bg-gradient-to-r from-gray-500/50 to-gray-600/50">
                        <p className="text-white font-semibold text-sm">{Status}</p>
                    </div>
                )
            }
        </div>
    );
}

export default StatusFragment;
