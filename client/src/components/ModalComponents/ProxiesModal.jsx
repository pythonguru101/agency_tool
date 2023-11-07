import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthValue } from '../ProtectedRoutes/AuthContext';

const ProxiesModal = ({ updateData }) => {
    const [proxy, setProxy] = useState("")
    const [error, setError] = useState("")
    const { currentUser } = useAuthValue();

    useEffect(() => {
        // Get the proxies from the local storage
        axios({
            method: 'POST',
            url: import.meta.env.VITE_API_DOMAIN + '/users/proxies/export',
            data: {
                email: currentUser,
            }
        }).then((res) => {
            const proxies = res.data.proxies; // This format : [host:port:username:password, host:port:username:password, ...]
            // All of them are of this format http://spg6ppteqj:xq46vlqhOAY7iDn7tt@gate.smartproxy.com:10008
            // Should be converted to this format gate.smartproxy.com:10008:spg6ppteqj:xq46vlqhOAY7iDn7tt
            let newProxies = [];
            proxies.forEach((proxy) => {
                // get rid of the http://
                let newProxy = proxy.split("//")[1];
                const [username, password] = newProxy.split("@")[0].split(":");
                const [host, port] = newProxy.split("@")[1].split(":");
                newProxies.push(`${host}:${port}:${username}:${password}`);
            })
            setProxy(newProxies.join("\n"));
        }).catch((err) => {
            console.error(err.data);
        })

    }, [])

    useEffect(() => {
        // Make sure that it's of pattern: host:port:username:password
        if (proxy === "") {
            setError("");
            return;
        }
        const proxiesRegex = /^([^:\n]+):([^:\n]+):([^:\n]+):([^:\n]+)$/gm;
        const matches = [...proxy.matchAll(proxiesRegex)];
        if (matches.length !== proxy.split("\n").length) {
            setError(
                "Use this pattern separated by new lines: (host:port:username:password)"
            );
            return;
        }
        setError("");
        // get the strings separated by a new line
        let parsedProxies = proxy.split("\n");
        parsedProxies.forEach((proxy, index) => {
            const [host, port, username, password] = proxy.split(":");
            parsedProxies[index] = `http://${username}:${password}@${host}:${port}`;
        });
        updateData({parsedProxies, Type:"Proxies"});
    }, [proxy]);




    useEffect(() => {
        if (error !== "") updateData(null)
    }, [error])

    return (
        <form className="flex flex-col gap-5">
            <div className="flex m-5 flex-col gap-5">
            {/* Errors will be displayed here */}
            {error && <div className="text-red-400 text-base font-semibold">{error}</div>}
            <div className="flex flex-col gap-2">
                <label htmlFor="proxy" className="block text-sm font-medium leading-6 text-white">
                    Proxy Input
                </label>
                <textarea
                    id="proxy"
                    name="proxy"
                    type="text"
                    autoComplete="proxy"
                    required
                    rows={10}
                    value={proxy}
                    onChange={e => setProxy(e.target.value)}
                    className="block p-2 transition duration-300 focus:-translate-y-1 outline-none w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
            </div>
            {/* Don't have a proxy ? (This message will be displayed with three icons that redirect to the proxy providers in form of logos) */}
            <div className="flex flex-row">
                <div className="flex flex-col gap-2">
                    <label htmlFor="proxy" className="block text-sm font-medium leading-6 text-indigo-500">
                        Don't have a proxy yet?
                    </label>
                    <div className="flex flex-row justify-center gap-5 drop-shadow-lg mt-2">
                        <a href="https://proxiware.com/?ref=agencytool" target="_blank" rel="noreferrer">
                            <img className="hover:-translate-y-1 hover:opacity-70 transition duration-300 rounded-full p-2 min-w-fit sw-fit h-12 bg-gray-900" src="https://cdn.discordapp.com/attachments/1120769135362719764/1128844622542680084/1691679.png" alt="ProxySP" />
                        </a>
                        <a className="rounded" href="https://iproyal.com/?r=agencytool" target="_blank" rel="noreferrer">
                            <img className="hover:-translate-y-1 hover:opacity-70 transition duration-300 w-fit h-12 min-w-fit rounded-full" src="https://cdn.discordapp.com/attachments/1120769135362719764/1128852775229460580/e9WQbtk5HNum1EnSZLahog396AvbBWSIslc3xBKkh16YzpkxJPRxvYxc0REkFsQeYeY9uY7E9YQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvFPA75PGKcVz7xTAAAAAElFTkSuQmCC.png" alt="ProxyRack" />
                        </a>
                        <a href="https://www.webshare.io/?referral_code=340qonitwjmr" target="_blank" rel="noreferrer">
                            <img className="hover:-translate-y-1 hover:opacity-70 transition duration-300 rounded-full p-1 min-w-fit w-fit h-12 bg-white" src="https://cdn.discordapp.com/attachments/1120769135362719764/1128844740272590998/5e43450ab0ed9a85b43f17ec_icon1_margin.png" alt="ProxyCheap" />
                        </a>
                    </div>
                </div>
                {/* "We recommend rotating residential proxies starting at 1GB bandwidth." make this message as a little tooltip in the bottom */}
            </div>
            <div className="flex flex-col">
                <label htmlFor="proxy" className="block text-sm font-medium leading-6 text-gray-400">
                    We recommend rotating residential proxies starting at 1GB bandwidth.
                </label>
            </div>
        </div>
    </form>
    );
}

export default ProxiesModal;
