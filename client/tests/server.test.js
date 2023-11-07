import axios from "axios";

const get_threads = ({ email }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/users/threads',
        data: {
            email: email,
        }
    }).then((res) => {
        console.log(res.data.data);
    }).catch((err) => {
        console.log("error");
    })
}

const create_thread = ({ email, assignment }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/create',
        data: {
            email: email,
            assignment: assignment,
        }
    }).then((res) => {
        console.log(res.data.thread_data);
    }).catch((err) => {
        return ("error");
    })
}

const input_thread = ({ email, ID, data }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/input',
        data: {
            email: email,
            ID: ID,
            data: data,
        }
    }).then((res) => {
        return (res.data);
    }).catch((err) => {
        return ("error");
    })
}

const get_thread = ({ email, ID }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/get',
        data: {
            email: email,
            ID: ID,
        }
    }).then((res) => {
        console.log(res.data.data);
    }).catch((err) => {
        console.error(err.data);
    })
}

const create = ({ email, assignment, data }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/create',
        data: {
            email: email,
            assignment: assignment,
        }
    }).then((res) => {
        const id = res.data.thread_data.ID;
        axios({
            method: 'POST',
            url: 'http://localhost:5000/threads/input',
            data: {
                email: email,
                ID: id,
                data: data,
            }
        }).then((res) => {
            // get the thread
            axios({
                method: 'POST',
                url: 'http://localhost:5000/threads/get',
                data: {
                    email: email,
                    ID: id,
                }
            }).then((res) => {
                console.log(res.data);
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


const refresh_user = ({ email, password }) => {
    // Delete user and recreate it with this new password : "test" and this mail : "test"
    axios({
        method: 'POST',
        url: 'http://localhost:5000/users/delete',
        data: {
            email: email,
        }
    }).then((res) => {
        axios({
            method: 'POST',
            url: 'http://localhost:5000/users/register',
            data: {
                email: email,
                password: password,
            }
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            return ("error");
        })
    }).catch((err) => {
        return ("error");
    })
}

const register = ({ email, password }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/users/register',
        data: {
            email: email,
            password: password,
        }
    }).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        return ("error");
    })
}

const start_thread = ({ email, ID }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/start',
        data: {
            email: email,
            ID: ID,
        }
    }).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        return ("error");
    })
}

const kill_thread = ({ email, ID }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/threads/kill',
        data: {
            email: email,
            ID: ID,
        }
    }).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.error(res.data);
    })
}

const export_proxies = ({ email }) => {
    axios({
        method: 'POST',
        url: 'http://localhost:5000/users/proxies/export',
        data: {
            email: email,
        }
    }).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.error(err.data);
    })
}

// create({ email: "test", assignment: 1, data: {"test":"test"}});
// start_thread({ email: "test", ID: 602268356 });
// get_thread({ email: "test", ID: 602268356 });
// kill_thread({ email: "test", ID: 602268356 });
// get_thread({ email: "test", ID: 602268356 });

// refresh_user({ email: "test", password: "test" });

// export_proxies({ email: "test" });
// get_thread({ email: "test", ID: 818805043 });
// get_threads({ email: "test" }); 



// //! SOCKET IO SIDE

// import { io } from "socket.io-client";
// const socket = io("http://localhost:5001");

// socket.on("error_user_test", (error) => {
//     console.log(error);
// }
// );

// get_threads({ email: "test" });
// get_thread({ email: "test", ID: 245401988 });
refresh_user({ email: "test", password: "test" });
// register({ email: "test", password: "test" });