import { mat4 } from 'gl-matrix'

import defaultVertShader from '../../shaders/vertex.glsl?raw'

import { initBuffers, initBuffersCircle } from './buffers'

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  // Move the drawing position a bit to where we want to start drawing the square.
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -1.0]);
  // mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Zoomed out

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
  {
    const numComponents = 3;  // pull out 3 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

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

}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export const createCursor = (fragShader) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1000

  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    throw new Error('WebGL not supported');
  }


  // Initialize a shader program; this is where all the lighting for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, defaultVertShader, fragShader);

  // Collect all the info needed to use the shader program.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      time: gl.getUniformLocation(shaderProgram, 'time'),
      score: gl.getUniformLocation(shaderProgram, 'score'),
    },
  };


  const OUTPUTS = { 
    animate: true,
    cursor: canvas,
    score: NaN
  }

  const buffers = initBuffers(gl);
  // const buffers = initBuffersCircle(gl);

  var then = 0;

  let startTime = performance.now() / 1000;

  // Draw the scene repeatedly
  function render(now) {

    if (!OUTPUTS.animate) return 

    now *= 0.001;  // convert to seconds

    const elapsedTime = (now - startTime); // Elapsed seconds
    const deltaTime = now - then;
    then = now;

    gl.uniform1f(programInfo.uniformLocations.time, elapsedTime);

    gl.uniform1f(programInfo.uniformLocations.score, OUTPUTS.score)

    drawScene(gl, programInfo, buffers, deltaTime);


    const offset = 0;
    const { drawType, vertexCount } = buffers
    gl.drawArrays(drawType, offset, vertexCount);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  
  return OUTPUTS

}