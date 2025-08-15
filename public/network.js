
import { Application, Assets, Sprite } from './pixi.js';
import Terminal from './terminal.js';

(async () => {
    // Create the application helper and add its render target to the page
    let app = new Application({
        width: 960,
        height: 540
    });
    document.getElementById('canvas-container').appendChild(app.view);

    //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    //PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';
    
    //console.log(PIXI);

    const sheet = await Assets.load('/bomber-sprite.json');
    //sheet.textureSource.scaleMode = 'nearest';
    
    //let sprite = new PIXI.Sprite(sheet.textures["tile-wall"]);
    let sprite = new Sprite();

    var test = {
        0: "he",
        1: "34"
    };

    /*Null = 0,
    1 East,
    2 SouthEast,
    3 South,
    4 SouthWest,
    5 West,
    6 NorthWest,
    7 North,
    8 NorthEast,
    9 Count*/
 
    var miscAnimations = [
        ["wall"],
        ["floor"],
        ["floor-shadow"],
        ["breakable-wall"],
        ["power-bomb-0", "power-bomb-1"],
        ["power-fire-0", "power-fire-1"],
        ["power-speed-0", "power-speed-1"],
        ["power-nuke-0", "power-nuke-1"],
        ["power-click-0", "power-click-1"],
        ["power-punch-0", "power-punch-1"],
        ["power-kick-0", "power-kick-1"],
        ["bomb-0", "bomb-1", "bomb-2"],
        ["exploded-wall-0", "exploded-wall-1", "exploded-wall-2", "exploded-wall-3", "exploded-wall-4", "exploded-wall-5"],
        ["exploded-power-0", "exploded-power-1", "exploded-power-2", "exploded-power-3", "exploded-power-4", "exploded-power-5", "exploded-power-6"]
    ];

    var boomAnimations = {
        0: ["boom-c-0","boom-c-1","boom-c-2","boom-c-3","boom-c-4"],
        1: ["boom-e-0","boom-e-1","boom-e-2","boom-e-3","boom-e-4"],
        2: ["boom-se-0","boom-se-1","boom-se-2","boom-se-3","boom-se-4"],
        3: ["boom-s-0","boom-s-1","boom-s-2","boom-s-3","boom-s-4"],
        4: ["boom-sw-0","boom-sw-1","boom-sw-2","boom-sw-3","boom-sw-4"],
        5: ["boom-w-0","boom-w-1","boom-n-2","boom-w-3","boom-w-4"],
        7: ["boom-n-0","boom-n-1","boom-w-2","boom-n-3","boom-n-4"]
    };

    var playerAnimations = {
        1: {
            1: ["player-white-e-0", "player-white-e-1", "player-white-e-2"],
            3: ["player-white-s-0", "player-white-s-1", "player-white-s-2"],
            5: ["player-white-w-0", "player-white-w-1", "player-white-w-2"],
            7: ["player-white-n-0", "player-white-n-1", "player-white-n-2"],
            8: ["player-white-death-0","player-white-death-1","player-white-death-2","player-white-death-3","player-white-death-4","player-white-death-5","player-white-death-6"]
        },
        2: {
            1: ["player-blue-e-0", "player-blue-e-1", "player-blue-e-2"],
            3: ["player-blue-s-0", "player-blue-s-1", "player-blue-s-2"],
            5: ["player-blue-w-0", "player-blue-w-1", "player-blue-w-2"],
            7: ["player-blue-n-0", "player-blue-n-1", "player-blue-n-2"],
            8: ["player-blue-death-0","player-blue-death-1","player-blue-death-2","player-blue-death-3","player-blue-death-4","player-blue-death-5","player-blue-death-6"]
        },
        3: {
            1: ["player-black-e-0", "player-black-e-1", "player-black-e-2"],
            3: ["player-black-s-0", "player-black-s-1", "player-black-s-2"],
            5: ["player-black-w-0", "player-black-w-1", "player-black-w-2"],
            7: ["player-black-n-0", "player-black-n-1", "player-black-n-2"],
            8: ["player-black-death-0","player-black-death-1","player-black-death-2","player-black-death-3","player-black-death-4","player-black-death-5","player-black-death-6"]
        },
        4: {
            1: ["player-red-e-0", "player-red-e-1", "player-red-e-2"],
            3: ["player-red-s-0", "player-red-s-1", "player-red-s-2"],
            5: ["player-red-w-0", "player-red-w-1", "player-red-w-2"],
            7: ["player-red-n-0", "player-red-n-1", "player-red-n-2"],
            8: ["player-red-death-0","player-red-death-1","player-red-death-2","player-red-death-3","player-red-death-4","player-red-death-5","player-red-death-6"]
        }
    };

    //let sheet = PIXI.Loader.shared.resources["bomber-sprite.json"].spritesheet;
    //let sprite = new PIXI.Sprite(sheet.textures["tile-wall"]);

    // Create the sprite and add it to the stage
    //let sprite = PIXI.Sprite.from('/bomber.png');

    app.stage.addChild(sprite);

    // Add a ticker callback to move the sprite back and forth
    let counter = 0;
    let frame = 0;
    let elapsed = 0.0;
    app.ticker.add((delta) => {
        elapsed += delta;
        sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
        sprite.y = 100.0;
        
        counter++;
        if (counter > 10) {
            sprite.texture = sheet.textures[miscAnimations[frame][0]];
            frame++;
            if (frame >= miscAnimations.length) { frame = 0; }
            counter = 0;
        }
        
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
    //const socket = new WebSocket("wss://go-gin-web-server-32.onrender.com/session/1");
    //socket.binaryType = "arraybuffer";
    
    /*
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
    */

})();

