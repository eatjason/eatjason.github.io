
import Terminal from './terminal.js';

(async () => {
    // Create the application helper and add its render target to the page
    let app = new PIXI.Application({
        resizeTo: document.getElementById('canvas-container'),
        resolution: devicePixelRatio 
    });
    document.getElementById('canvas-container').appendChild(app.view);

    // Create the sprite and add it to the stage
    let sprite = PIXI.Sprite.from('/bunny.png');
    app.stage.addChild(sprite);

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    app.ticker.add((delta) => {
        elapsed += delta;
        sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
    });


    const t = new Terminal('terminal-container').command({
        'new': {
            pr: {
                text: 'string',
                num: 'number',
                flt: 'float',
                bo: 'boolean'
            },
            fn: function(self, pr) {
                self.append(`made new ${pr.text}, ${pr.num}, ${pr.flt}, ${pr.bo}`);
            }
        }
    });

    // Create WebSocket connection.
    const socket = new WebSocket("wss://go-gin-web-server-32.onrender.com/session/1");
    socket.binaryType = "arraybuffer";
    
    // Connection opened
    socket.addEventListener("open", (event) => {
        //socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        //console.log("Message from server ", event.data);
        if (event.data instanceof ArrayBuffer) {
            if (event.data.byteLength == 1) {
                console.log('slot message');
            } else {                
                // binary frame
                const view = new DataView(event.data);
                console.log(view.getInt32(0));
            }
        } else {
            // text frame
            console.log(event.data);
        }
    });

})();

