// const axios = require('axios');

// async function import_proxies() {
//     await axios({
//         method: 'POST',
//         url: 'http://localhost:5000/users/proxies/import',
//         data: {
//             email: 'test',
//             proxies: [
//                 '45.85.160.52:7144:gglqnkii:7eprouv2rdcu',
//                 '45.158.185.82:8594:gglqnkii:7eprouv2rdcu',
//                 '154.16.243.121:6265:gglqnkii:7eprouv2rdcu',
//                 '45.85.160.145:7237:gglqnkii:7eprouv2rdcu'
//             ]
//         }
//     }).then((res) => {
//         console.log(res.data)
//     })
// }

// async function thread_create() {
//     const r = await axios({
//         method: 'POST',
//         url: 'http://localhost:5000/threads/create',
//         data: {
//             email: 'test',
//             assignment: 2,
//         }
//     })
//     console.log(r.data.thread_data.ID)
//     return r.data.thread_data.ID
// }

// async function thread_input(ID) {
//     await axios({
//         method: 'POST',
//         url: 'http://localhost:5000/threads/input',
//         data: {
//             email: 'test',
//             ID: ID,
//             data: {
//                 username: 'jfidzu',
//                 password: '5grttqwx',
//                 target: 'zachking'
//             }
//         }
//     }).then((res) => {
//         console.log(res.data)
//         return;
//     })
// }

// async function thread_start(ID) {
//     await axios({
//         method: 'POST',
//         url: 'http://localhost:5000/threads/start',
//         data: {
//             email: 'test',
//             ID: ID,
//         }
//     }).then((res) => {
//         console.log(res.data)
//         return;
//     })
// }

// async function main() {
//     await thread_start(130717571)
// }

// main()


// let a = { a: 1, b: 2 }
// console.log(Object.keys(a).length)

const axios = require('axios');

const ipAddress = '66.135.29.60';
const port = 1590;

const url = "https://agencytoolbackend.online";

axios
    .get(url)
    .then((response) => {
        // Handle the response data here
        console.log('Response:', response.data);
    })
    .catch((error) => {
        // Handle errors here
        console.error('Error:', error);
    });
