function Terminal(id) {

    const self = this;

    // set up mark up
    this.terminalContainer = document.getElementById(id);
    this.terminalContainer.setAttribute('tabindex', '0');    
    this.terminalContainer.innerHTML = `
        <div id="terminal-output-area" data-astro-cid-axl53r3k></div>
        <div id="terminal-input-line" data-astro-cid-axl53r3k>
            <span id="terminal-prompt" data-astro-cid-axl53r3k>command: </span>
            <input type="text" id="terminal-command-input" autocomplete="off" data-astro-cid-axl53r3k>
        </div>
    `;

    // makes it so we can click the console and start typing
    this.terminalContainer.addEventListener('keydown', function(event) {
        if (document.activeElement != self.commandInput) {
            self.terminalContainer.scrollTop = self.terminalContainer.scrollHeight; // Scroll to bottom
            self.commandInput.focus();
            //self.commandInput.dispatchEvent(event);
        }
    });

    this.commandInput = document.getElementById('terminal-command-input');
    this.outputArea = document.getElementById('terminal-output-area');

    this.commandInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const input = self.commandInput.value.split(/(\s+)/).filter( e => e.trim().length > 0);
            if (input.length > 0) {
                self.append(`<span>command: </span>${self.commandInput.value}`);
                const command = input[0].toLowerCase();
                const params = input.slice(1);
                const data = self.commands[command];

                try {
                    let pack = {};
                    if (data == undefined) {   
                        throw new Error('unrecognized command');
                    }
                    if (data.pr !== undefined) {   
                        let pindex = 0;
                        for (const key in data.pr) {
                            if (params.length <= pindex) {
                                throw new Error('too few parameters');
                            }
                            const param = params[pindex];
                            let value = null;
                            switch (data.pr[key]) {
                                case 'number':
                                    value = parseInt(param);
                                    if (isNaN(value)) {
                                        throw new Error(`${param} is not a number`);
                                    }
                                    break;

                                case 'float':
                                    value = parseFloat(param);
                                    if (isNaN(value)) {
                                        throw new Error(`${param} is not a float`);
                                    }    
                                    break;
                    
                                case 'boolean':
                                    value = Boolean(param);  
                                    break;
                                
                                default:
                                    // don't do anything (strings go here too)
                                    break;
                            }
                            pack[key] = param;
                            ++pindex;
                        }
                    } else {
                        pack = params;
                    }
                    data.fn(self, pack);
                } catch (error) {
                    self.append(error.toString());
                }

                self.outputArea.innerHTML = self.buffer.join('');
                self.commandInput.value = '';
                self.terminalContainer.scrollTop = self.terminalContainer.scrollHeight; // Scroll to bottom
            }
        }
    });

    this.buffer = [];

    this.commands = {
        'help': {
            fn: function(self, pr) {
                self.append('Available commands: help, echo [text], clear');
            }
        },
        'clear': {
            fn: function(self, pr) {
                self.clear();
            }
        },
        'echo': {
            pr: {
                text: 'string'
            },
            fn: function(self, pr) {
                self.append(pr.text);
            }
        }
    }

}

Terminal.prototype.append = function (text) {
    this.buffer.push(`<p>${text}</p>`);
}

Terminal.prototype.clear = function () {
    this.buffer = [];
}

Terminal.prototype.command = function (commands) {
    this.commands = { ...this.commands, ...commands };
}

export default Terminal;