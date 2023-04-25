const vertexShaders = {
  firstPass: `
    varying vec3 worldSpaceCoords;

    void main()
    {
      worldSpaceCoords = position + vec3(0.5, 0.5, 0.5); 
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  secondPass: `
    varying vec3 worldSpaceCoords;
    varying vec4 projectedCoords;

    void main()
    {
      worldSpaceCoords = position + vec3(0.5, 0.5, 0.5);
      gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );
      projectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
};

export default vertexShaders;
