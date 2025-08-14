(function( se, $, undefined ) {
    
    //var canvas = document.getElementById("canvas");
    //var ctx = canvas.getContext("2d");
    //ctx.fillStyle = "green";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);

    se.console = {
        buffer: [],
        clear: function() {
            this.buffer = [];
        },
        append: function(text) {
            this.buffer.push(`<p>${text}</p>`);
            // if the array is too big, start popping off the top!
        }
    };

    const textArea = document.getElementById('text');    
    const terminalContainer = document.getElementById('terminal-container');    
    const outputArea = document.getElementById('output-area');
    const commandInput = document.getElementById('command-input');

    commandInput.focus();

    // setInterval(function() { console.log(document.activeElement); }, 1000);

    // makes it so we can click the console and start typing
    terminalContainer.addEventListener('keydown', function(event) {
        if (document.activeElement != commandInput) {
            terminalContainer.scrollTop = terminalContainer.scrollHeight; // Scroll to bottom
            commandInput.focus();
            //commandInput.dispatchEvent(event);
        }
    });

    textArea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { // Check if the pressed key is Tab
            e.preventDefault(); // Prevent the default tab behavior (e.g., focus change)

            const start = textArea.selectionStart; // Get the cursor's starting position
            const end = textArea.selectionEnd; // Get the cursor's ending position

            // Insert two spaces at the cursor's position
            textArea.value = textArea.value.substring(0, start) + '  ' + textArea.value.substring(end);

            // Reposition the cursor after the inserted spaces
            textArea.selectionStart = textArea.selectionEnd = start + 2;
        }
    });

    commandInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const input = commandInput.value.split(/(\s+)/).filter( e => e.trim().length > 0);
            if (input.length > 0) {
                se.console.append(`<span>command: </span>${commandInput.value}`);
                const command = input[0].toLowerCase();
                const params = input.slice(1);
                const data = se.commands[command];

                try {
                    let pack = {};
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
                    data.fn(pack);
                } catch (error) {
                    se.console.append(error.toString());
                }

                outputArea.innerHTML = se.console.buffer.join('');
                commandInput.value = '';
                terminalContainer.scrollTop = terminalContainer.scrollHeight; // Scroll to bottom
            }
        }
    });

    se.commands = {};

    se.command = function(cmd) {
        se.commands = { ...se.commands, ...cmd };
    }

    se.command({
        'help': {
            fn: function(data) {
                se.console.append('Available commands: help, echo [text], clear');
            }
        },
        'clear': {
            fn: function(data) {
                se.console.clear();
            }
        },
        'echo': {
            pr: {
                text: 'string'
            },
            fn: function(pr) {
                se.console.append(pr.text);
            }
        }
    });


    const FPS = 60;
    let prevTick = 0;
    let G_gl;
    let G_programInfo;
    let G_buffers;
    let G_rotation;

    se.beginRender = function (gl, programInfo, buffers) {
        G_gl = gl;
        G_programInfo = programInfo;
        G_buffers = buffers;
        G_rotation = 0;
        se.render();
    }

    se.render = function() {
        requestAnimationFrame(se.render);
        let now = Math.round(FPS * Date.now() / 1000);
        if (now == prevTick) return;
        prevTick = now;
        se.drawScene(G_gl, G_programInfo, G_buffers);
    }

    // open gl stuff
    se.initBuffers = function(gl) {
        const positionBuffer = se.initPositionBuffer(gl);

        return {
            position: positionBuffer,
        };
    }

    se.initPositionBuffer = function(gl) {
        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the square.
        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        return positionBuffer;
    }

    se.drawScene = function(gl, programInfo, buffers) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();

        G_rotation += 0.025;
        mat4.rotateZ(
            modelViewMatrix,
            modelViewMatrix,
            G_rotation
        );

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]
        ); // amount to translate

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        setPositionAttribute(gl, buffers, programInfo);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        }

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        function setPositionAttribute(gl, buffers, programInfo) {
        const numComponents = 2; // pull out 2 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }



        //
    // start here
    //
    se.main = function() {
        const canvas = document.getElementById("canvas");
        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
            );
            return;
        }

        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Vertex shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;

        const fsSource = `
            void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = se.initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attribute our shader program is using
        // for aVertexPosition and look up uniform locations.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            },
            uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            },
        };

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        const buffers = se.initBuffers(gl);

        // Draw the scene
        //se.drawScene(gl, programInfo, buffers);
        se.beginRender(gl, programInfo, buffers);
    }

    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    se.initShaderProgram = function(gl, vsSource, fsSource) {
        const vertexShader = se.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = se.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
            );
            return null;
        }

        return shaderProgram;
    }

    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    se.loadShader = function(gl, type, source) {
        const shader = gl.createShader(type);

        // Send the source to the shader object

        gl.shaderSource(shader, source);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
            );
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    
    se.main();

}( window.se = window.se || {}, undefined ));