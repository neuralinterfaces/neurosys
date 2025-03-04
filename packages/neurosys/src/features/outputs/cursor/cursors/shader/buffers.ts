export function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    const positions = [];
    const colors = [];
  
    const numRows = 10;
    const numCols = 10;
    const tileSizeX = 2 / numCols; // Full width divided by columns
    const tileSizeY = 2 / numRows; // Full height divided by rows
  
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * tileSizeX - 1;
            const y = row * tileSizeY - 1;
  
            positions.push(
                x, y, 0,                          // Bottom-left
                x + tileSizeX, y, 0,              // Bottom-right
                x, y + tileSizeY, 0,              // Top-left
                x + tileSizeX, y, 0,              // Bottom-right
                x + tileSizeX, y + tileSizeY, 0,  // Top-right
                x, y + tileSizeY, 0               // Top-left
            );
  
            for (let i = 0; i < 6; i++) {
                colors.push(Math.random(), Math.random(), Math.random(), 1);
            }
        }
    }
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    return {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positions.length / 3,
        drawType: gl.TRIANGLES
    };
}
  
  export function initBuffersCircle(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    const positions = [];
    const colors = [];
    const numSegments = 100;
    const outerRadius = 1;
    const innerRadius = 2;  // Adjust inner radius for thickness
    const colorChange = 0.1;  // Smaller value for subtler color changes
  
    for (let i = 0; i <= numSegments; i++) {
      const angle = i * 2 * Math.PI / numSegments;
  
      // Outer vertex
      positions.push(outerRadius * Math.sin(angle), outerRadius * Math.cos(angle), 0);
      colors.push(
        Math.random(),
        Math.random(),
        Math.random(),
        1
      );
  
      // Inner vertex
      positions.push(innerRadius * Math.sin(angle), innerRadius * Math.cos(angle), 0);
      colors.push(Math.random() * colorChange, Math.random() * colorChange, Math.random() * colorChange, 1);
  
    }
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
      color: colorBuffer,
      vertexCount: (numSegments + 1) * 2, // Two vertices for each segment (inner and outer)
      drawType: gl.TRIANGLE_STRIP
    };
  }
  