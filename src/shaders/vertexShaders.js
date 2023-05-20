const vertexShaders = {
  firstPass: `
    varying vec3 worldSpaceCoords;

    uniform float stackLengthRatio;

    void main()
    {
      mat4 scaleMatrix;
      scaleMatrix[0] = vec4(1.0 / stackLengthRatio, 0.0, 0.0, 0.0);
      scaleMatrix[1] = vec4(0.0, 1.0, 0.0, 0.0);
      scaleMatrix[2] = vec4(0.0, 0.0, 1.0, 0.0);
      scaleMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);

      vec4 scaledWorldSpaceCoords = scaleMatrix * vec4((position + vec3(stackLengthRatio / 2.0, 0.5, 0.5)), 1.0);
      worldSpaceCoords = scaledWorldSpaceCoords.xyz; 
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  secondPass: `
    varying vec3 worldSpaceCoords;
    varying vec4 projectedCoords;

    uniform float stackLengthRatio;

    void main()
    {
      mat4 scaleMatrix;
      scaleMatrix[0] = vec4(1.0 / stackLengthRatio, 0.0, 0.0, 0.0);
      scaleMatrix[1] = vec4(0.0, 1.0, 0.0, 0.0);
      scaleMatrix[2] = vec4(0.0, 0.0, 1.0, 0.0);
      scaleMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);

      vec4 scaledWorldSpaceCoords = scaleMatrix * vec4((position + vec3(stackLengthRatio / 2.0, 0.5, 0.5)), 1.0);
      worldSpaceCoords = scaledWorldSpaceCoords.xyz; 
      
      gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );
      
      projectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
};

export default vertexShaders;
