import { useState, useEffect } from 'react';
import SelectedComponent from './SelectedComponent';

const SelectorComponent = ({ selectors, setSelected, selected }) => {
    return (
        <div className="w-fit bg-neutral-800/50 h-fit rounded-lg border drop-shadow border-neutral-400/20 p-1.5 flex flex-wrap justify-between">
            {selectors.map((selector, index) => (
                <SelectedComponent key={index} Name={selector} Activated={selected === selector} activate={() => {setSelected(selector)}} />
            ))}
        </div>
    );
}

export default SelectorComponent;
