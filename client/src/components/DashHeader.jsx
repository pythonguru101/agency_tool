import React from 'react';

const DashHeader = ({ dash_title_message}) => {
    return (
        <div className='flex items-center justify-center'>
            <h1 className="text-white whitespace-nowrap text-5xl font-bold">{dash_title_message}</h1>
        </div>
    );
}

export default DashHeader;
