const fragmentShaders = {
  firstPass: `
    varying vec3 worldSpaceCoords;

    void main()
    {
      gl_FragColor = vec4( worldSpaceCoords.xyz, 1 );
    }
  `,
  secondPass: `
    varying vec3 worldSpaceCoords;
    varying vec4 projectedCoords;
    uniform sampler2D tex, cubeTex, transferTex;
    uniform float steps;
    uniform float alphaCorrection;
    uniform float colorTreshLow;
    uniform float colorTreshHigh;

    const int MAX_STEPS = 888;

    vec4 sampleAs3DTexture( vec3 texCoord )
    {
        vec4 colorSlice1, colorSlice2;
        vec2 texCoordSlice1, texCoordSlice2;

        float zSliceNumber1 = floor(texCoord.z  * 255.0);

        float zSliceNumber2 = min( zSliceNumber1 + 1.0, 255.0); //Clamp to 255

        texCoord.xy /= 16.0;

        texCoordSlice1 = texCoordSlice2 = texCoord.xy;

        texCoordSlice1.x += (mod(zSliceNumber1, 16.0 ) / 16.0);
        texCoordSlice1.y += floor((255.0 - zSliceNumber1) / 16.0) / 16.0;

        texCoordSlice2.x += (mod(zSliceNumber2, 16.0 ) / 16.0);
        texCoordSlice2.y += floor((255.0 - zSliceNumber2) / 16.0) / 16.0;

        colorSlice1 = texture2D( cubeTex, texCoordSlice1 );
        colorSlice2 = texture2D( cubeTex, texCoordSlice2 );

        //vec3 tfColor1 = texture2D( transferTex, vec2( colorSlice1.a, 1.0) ).rgb;
        //vec3 tfColor2 = texture2D( transferTex, vec2( colorSlice2.a, 1.0) ).rgb;
        

        float zDifference = mod(texCoord.z * 255.0, 1.0);
        vec4 mixed = mix(colorSlice1, colorSlice2, zDifference);

        if (mixed.a > colorTreshLow && mixed.a < colorTreshHigh) {
          return vec4(1.0, 1.0, 1.0, mixed.a);
        } 
        return vec4(1.0, 1.0, 1.0, 0.0);
    }


    void main( void ) {

      vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
              ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0 );

      vec3 backPos = texture2D(tex, texc).xyz;
      vec3 frontPos = worldSpaceCoords;

      if ((backPos.x == 0.0) && (backPos.y == 0.0))
      {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec3 dir = backPos - frontPos;

      float rayLength = length(dir);

      float delta = 1.0 / steps;

      vec3 deltaDirection = normalize(dir) * delta;
      float deltaDirectionLength = length(deltaDirection);

      vec3 currentPosition = frontPos;

      vec4 accumulatedColor = vec4(0.0);
      float accumulatedAlpha = 0.0;
      float accumulatedLength = 0.0;
      float alphaScaleFactor = 25.6 * delta;

      vec4 colorSample;
      float alphaSample;

      for(int i = 0; i < MAX_STEPS; i++)
      {
        colorSample = sampleAs3DTexture( currentPosition );

        alphaSample = colorSample.a * alphaCorrection;
        alphaSample *= (1.0 - accumulatedAlpha);
        alphaSample *= alphaScaleFactor;

        accumulatedColor += colorSample *  alphaSample;
        accumulatedAlpha += alphaSample;

        currentPosition += deltaDirection;
        accumulatedLength += deltaDirectionLength;

        if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 )
          break;
      }

      gl_FragColor  = accumulatedColor;
      //gl_FragColor = vec4(sampleAs3DTexture(frontPos).rgb, 1.0);
    }
  `,
};

export default fragmentShaders;