import { useState } from 'react';

const StatComponent = ({ description, stat, pourcentage }) => {

    function getPourcentageColor(pourcentage) {
        if (pourcentage) {
            if (pourcentage.startsWith("+")) {
                return "text-green-300/80";
            } else if (pourcentage.startsWith("-")) {
                return "text-red-400";
            } else {
                return "text-white";
            }
        } else {
            return "";
        }
    }

    return (
        <div className="bg-neutral-800/50 w-1/4 min-w-fit h-fit rounded-xl border drop-shadow border-neutral-400/20 p-5">
            <h3 className="text-white/70 font-bold" >{description}</h3>
            <div className="flex items-center justify-between gap-5">
                <h1 className="text-white text-5xl font-extrabold">
                    {stat ? stat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}
                </h1>
                <div className="flex flex-col items-center">
                    <h3 className={`font-bold text-3xl ${getPourcentageColor(pourcentage)}`}>{pourcentage}</h3>
                    <h3 className="text-white/50 font-semibold whitespace-nowrap">vs last week</h3>
                </div>
            </div>
        </div>
    );
}

export default StatComponent;
