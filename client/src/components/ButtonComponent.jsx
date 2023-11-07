import React from 'react';
// Arrow left and arrow right bs icons
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const ButtonComponent = ({ Type, Action }) => {
    return (
        <button onClick={()=>Action()} className=" whitespace-nowrap cursor-pointer hover:opacity-80 transition duration-300 min-w-fit py-1.5 px-4 text-white drop-shadow-lg font-medium text-lg flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded">
            <h2 className=''>
                {Type}
            </h2>
            {
                {
                    Back: <BsArrowLeft/>,
                    Next: <BsArrowRight/>
                }[Type ? Type : "Back"] // If Type is not defined, then it will be Back, else it will be
            }
        </button>
    );
}

export default ButtonComponent;
