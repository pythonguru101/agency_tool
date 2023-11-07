const { EventEmitter } = require('events');
const { PythonShell } = require('python-shell');

class BotExecutor extends EventEmitter {
    constructor() {
        super();
        this.options = {
            mode: 'text',
            // Set other default options here...
        };
    }

    executeScript(args) {
        const scriptOptions = { ...this.options, args };

        let pyshell = new PythonShell('./scripts/main.py', scriptOptions);

        pyshell.on('message', (message) => {
            // Emit the message sent from the Python script
            if (message.includes("JOB FINISHED")) {
                let value = message.split("JOB FINISHED")[1]
                value = value.replace(/'/g, '"')
                this.emit('job_finished', value);
            }
            else {
                this.emit('message', message);
            }
        });

        pyshell.end((err, code, signal) => {
            if (err) {
                // Emit the error encountered during the script execution
                this.emit('error', err);
            }

            // If code is 0, it means the execution was successful else there was an error
            this.emit('done', code === 0 ? 'success' : 'failure');
        });

        pyshell.on('stderr', (stderr) => {
            console.log(stderr);
            // Emit the error message received from the Python script's stderr
            this.emit('error', new Error(stderr));
        });
    }
}

// // Example usage
// const botExecutor = new BotExecutor();

// // Register event listeners for the messages and the script completion
// botExecutor.on('message', (message) => {
//     console.log('Received message:', message);
//     // Process the message here or perform any actions based on the message
// });

// // Job finished
// botExecutor.on('job_finished', (message) => {
//     console.log('Job finished with message:', message);
//     // Process the message here or perform any actions based on the message
// });

// botExecutor.on('done', (message) => {
//     console.log('Done with :', message);
//     // Any other actions you want to perform after the script completes...
// });


// botExecutor.on('error', (err) => {
//     console.error('Error executing script:', err);
// });

// // Start the Python script execution with custom arguments
// const args = [
//     "scrape_hashtag",
//     "cars",
//     5,
//     "instabottestinstabottest",
//     "thisisabot",
//     "http://spg6ppteqj:xq46vlqhOAY7iDn7tt@gate.smartproxy.com:10000"
// ];

// botExecutor.executeScript(args);

// // The bot continues its operation while the Python script runs asynchronously
// // and emits messages and events.
module.exports = BotExecutor; // Export the class so it can be imported in other files