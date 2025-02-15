attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUvs; // Pass UVs to the fragment shader

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    // Convert position from (-1 to 1) range to (0 to 1) UV range
    vUvs = (aVertexPosition.xy + 1.0) * 0.5;
}