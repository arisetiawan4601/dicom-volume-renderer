const fragmentShaders = {
  firstPass: `
    varying vec3 worldSpaceCoords;

    void main()
    {
      gl_FragColor = vec4( worldSpaceCoords.xyz, 1 );
    }
  `,
  secondPass: `
    precision highp sampler3D;

    varying vec3 worldSpaceCoords;
    varying vec4 projectedCoords;
    uniform sampler2D tex, transferTex;
    uniform sampler3D cubeTex;
    uniform sampler3D cubeTex2;
    uniform float steps;
    uniform float alphaCorrection;
    uniform float colorTreshLow;
    uniform float colorTreshHigh;
    uniform float alpha;
    uniform float beta;

    void main( void ) {

      vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
              ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0);

      // backPos is the worldSpaceCoords from the previous pass
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

      vec4 colorSample;
      float alphaFactor;

      for (int i = 0; i < 999; i++) {
        float textureColor = texture(cubeTex, currentPosition).r;
        textureColor = (alpha * textureColor) + beta;
        alphaFactor = textureColor * alphaCorrection * 25.6 * delta * (1.0 - accumulatedAlpha);

        if (textureColor >= colorTreshLow && textureColor <=  colorTreshHigh) {
          if (texture(cubeTex2, currentPosition).r == 1.0) {
            colorSample = vec4(1.0, 0.0, 0.0, textureColor);
          } else {
            colorSample = vec4(1.0, 1.0, 1.0, textureColor);
          }
        } 
        // if (textureColor >= 0.9) {
        //   colorSample = vec4(1.0, 0.0, 0.0, textureColor);
        // } else {
        //   colorSample = vec4(1.0, 1.0, 1.0, textureColor);
        // }
        
        accumulatedColor += colorSample * alphaFactor;
        accumulatedAlpha += alphaFactor;

        currentPosition += deltaDirection;
        accumulatedLength += deltaDirectionLength;

        if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 )
          break;
      }

      gl_FragColor = accumulatedColor;






      // vec4 accumulatedColor = vec4(0.0);
      // float accumulatedAlpha = 0.0;
      // float accumulatedLength = 0.0;
      // float alphaScaleFactor = 25.6 * delta;

      // vec4 colorSample;
      // float alphaSample;

      // for(int i = 0; i < MAX_STEPS; i++)
      // {
        
      //   float textureColor = texture(cubeTex, currentPosition).r;
      //   if (true) {
      //     accumulatedColor = vec4(textureColor, 0.0, 0.0, 1.0);
      //   break;

      //   } else {
      //     // accumulatedColor = vec4(0.0, 1.0, 0.0, 1.0);
      //   }
      //   // // contrast and brightness adjustment
      //   // textureColor = (alpha * textureColor) + beta;

      //   // // if (textureColor > 1.0) {
      //   // //   textureColor = 1.0;
      //   // // }

      //   // // // adjust brightness and contrass
      //   // // textureColor = mix(textureColor * brightness, 
      //   // //   mix(0.5, textureColor, contrast), 0.5);

      //   // colorSample = vec4(1.0, 1.0, 1.0, textureColor);
      //   // if (textureColor <= colorTreshLow || textureColor >= colorTreshHigh) {
      //   //   colorSample = vec4(1.0, 1.0, 1.0, 0.0);
      //   // }

      //   // alphaSample = colorSample.a * alphaCorrection * alphaScaleFactor * (1.0 - accumulatedAlpha);

      //   // accumulatedColor += colorSample * alphaSample;
      //   // accumulatedAlpha += alphaSample;

      //   // currentPosition += deltaDirection;
      //   // accumulatedLength += deltaDirectionLength;

      //   if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 )
      //     break;
      // }

      // // gl_FragColor = accumulatedColor;
      // gl_FragColor = vec4(worldSpaceCoords, 1.0);
      // // gl_FragColor  = vec4(1.0, 1.0, 1.0, -1.0);

      // // gl_FragColor = vec4(currentPosition, 1.0);
    }
  `,
};

export default fragmentShaders;
