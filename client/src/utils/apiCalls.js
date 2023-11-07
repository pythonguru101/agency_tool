import axios from 'axios';

export function create_thread({ email, assignment, data, refresh }) {
    axios({
        method: 'POST',
        url: import.meta.env.VITE_API_DOMAIN + '/threads/create',
        data: {
            email: email,
            assignment: assignment,
        }
    }).then((res) => {
        const id = res.data.thread_data.ID;
        axios({
            method: 'POST',
            url: import.meta.env.VITE_API_DOMAIN + '/threads/input',
            data: {
                email: email,
                ID: id,
                data: data,
            }
        }).then((res) => {
            // get the thread
            axios({
                method: 'POST',
                url: import.meta.env.VITE_API_DOMAIN + '/threads/get',
                data: {
                    email: email,
                    ID: id,
                }
            }).then((res) => {
                console.log(res.data);
                refresh()
            }
            ).catch((err) => {
                return (err);
            })
        }).catch((err) => {
            return (err);
        })
    }).catch((err) => {
        return (err);
    })
}

export function import_proxies({ email, proxies }) {
    axios({
        method: 'POST',
        url: import.meta.env.VITE_API_DOMAIN + '/users/proxies/import',
        data: {
            email: email,
            proxies: proxies,
        }
    }).then((res) => {
        axios({
            method: 'POST',
            url: import.meta.env.VITE_API_DOMAIN + '/users/proxies/export',
            data: {
                email: email,
            }
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        })
    }).catch((err) => {
        console.error(err);
    })
}

export const start_thread = ({ email, ID }) => {
    axios({
        method: 'POST',
        url: import.meta.env.VITE_API_DOMAIN + '/threads/start',
        data: {
            email: email,
            ID: ID,
        }
    }).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.log(err.data);
    })
}
