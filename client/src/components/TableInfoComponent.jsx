import { useState, useEffect } from 'react';
import TableFragment from './TableFragment';
import ButtonComponent from "./ButtonComponent";

const TableInfoComponent = ({ Title, tableHeaders, tableFragments, tablefragementsperpage, filter, TriggerRefresh }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [tableFragmentsPerPage, setTableFragmentsPerPage] = useState(tablefragementsperpage||5);
    const [NumberOfPages, setNumberOfPages] = useState(Math.ceil(tableFragments.length / tableFragmentsPerPage));
    const [Pages, setPages] = useState([]);
    const [Filter, setFilter] = useState(filter||"All");

    useEffect(() => {
        setFilter(filter||"All");
    }, [filter]);

    useEffect(() => {
        setNumberOfPages(Math.ceil(tableFragments.length / tableFragmentsPerPage));
    }, [tableFragments, tableFragmentsPerPage]);

    // Take the tablefragments and distribut them into pages
    useEffect(() => {
        try {
            let pages = [];
            // Include the filter here for the status
            let tableFragmentsFiltered = tableFragments.filter((frg) => {
                if (Filter === "All") {
                    return true;
                } else {
                    return frg.Status === Filter;
                }
            });

            setNumberOfPages(Math.ceil(tableFragmentsFiltered.length / tableFragmentsPerPage));
            for (let i = 0; i < NumberOfPages; i++) {
                pages.push(tableFragmentsFiltered.slice(i * tableFragmentsPerPage, (i + 1) * tableFragmentsPerPage));
            }
            setPages(pages);
        } 
        catch (err) {
            console.error(err);
        }
    }, [tableFragments, tableFragmentsPerPage, NumberOfPages, Filter]);

    function NextPage() {
        if (currentPage < NumberOfPages) {
            setCurrentPage(currentPage + 1);
        }
    }

    function PreviousPage() {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }


    return (
        <div className="gap-5 bg-neutral-800/50 min-w-fit h-fit min-h-fit rounded-lg border drop-shadow-xl border-neutral-400/20 p-6 mb-2 flex flex-col justify-start">
            <h2 className="place-self-start text-neutral-500/80 font-medium">
                {Title}
            </h2>
            <div className='drop-shadow-xl'>
                <table className="border border-neutral-400/20 rounded table-auto justify-start w-full min-h-fit">
                    <thead className=" bg-neutral-700/50 border-b border-neutral-400/20 ">
                        <tr className=" text-neutral-400/80 font-medium">
                            {
                                tableHeaders.map((header, index) => (
                                    <td key={index} className="p-4">
                                        {header}
                                    </td>
                                ))
                            }
                            <td/>
                        </tr>
                    </thead>
                    <tbody className="bg-neutral-500/10 h-fit min-w-fit">
                        {
                            Pages[currentPage - 1]?.map((frg, index) => {
                                return <TableFragment key={index} TableFragmentEls={frg} TriggerRefresh={()=>TriggerRefresh()}/>
                            })
                        }
                    </tbody>

                </table>
                <div className="flex items-center gap-2 p-3 justify-between rounded-b-xl border-t bg-neutral-700/50 first-line:border-b border-neutral-400/20 ">
                    <ButtonComponent Action={()=>PreviousPage()} Type="Back"/>
                    <h3 className="text-white font-semibold text-lg">{`${currentPage} Of ${NumberOfPages || 1}`}</h3>
                    <ButtonComponent Action={()=>NextPage()} Type="Next"/>
                </div>
            </div>
        </div>
    );
}

export default TableInfoComponent;
