precision mediump float; // Specifies medium precision for float values
varying vec2 vUvs;
uniform float time;
uniform float score;

void main() {
    // Normalize the uv coordinates to range -1 to 1
    vec2 uv = (vUvs - 0.5) * 2.0;
    
    // Define the minimum and maximum radius values based on the canvas size
    float minRadius = 0.1; // Minimum radius
    float maxRadius = 0.4; // Maximum radius
    
    // float score = 0.5 + sin(time) * 0.5; // Scale between 0 and 1
    
    // Calculate the radius using the min and max bounds, influenced by the sine wave
    float radius = minRadius + (maxRadius - minRadius) * score;
    
    // Compute the distance from the center (0,0)
    float dist = length(uv);
    
    // Define a threshold for the stroke (thickness of the circle's outline)
    float strokeThickness = 0.01;
    
    // Check if the distance is within the stroke range
    if (dist < radius && dist > radius - strokeThickness) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // white stroke
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // transparent fill
    }
}