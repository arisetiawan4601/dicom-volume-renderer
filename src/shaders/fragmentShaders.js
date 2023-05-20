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
    uniform float contrast;
    uniform float brightness;

    void main( void ) {
      // Transfer coordinates from [-1, 1] to [0, 1]
      vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0, 
        ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0);
      
      // backPosition is 3d texture coordinates from previous pass
      vec3 backPosition = texture2D(tex, texc).xyz;

      // frontPosition is 3d texture coordinates from this pass
      vec3 frontPosition = worldSpaceCoords;

      // if there is invalid backPosition value at the edge of the cube, just return;
      if ((backPosition.x == 0.0) && (backPosition.y == 0.0))
      {
        gl_FragColor = vec4(0.0);
        return;
      }

      // get ray vector and length
      vec3 ray = backPosition - frontPosition;
      float rayLength = length(ray);

      // calculate value and direction of the increment of each step
      float delta = 1.0 / steps;
      vec3 deltaDirection = normalize(ray) * 1.0 / steps;
      float deltaLength = length(deltaDirection);

      // start the ray casting from frontPosition
      vec3 currentPosition = frontPosition;

      vec4 accumulatedColor;
      float accumulatedLength;

      float textureIntensity;
      vec4 color;

      for(int i = 0; i < 998; i++) {
        // get intensity value for each step
        textureIntensity = texture(cubeTex, currentPosition).r;
        textureIntensity = (contrast * textureIntensity) + brightness;


        // if textureIntensity outside the treshold, then it is not contribute to the accumulated color
        if (textureIntensity <= colorTreshLow || textureIntensity >=  colorTreshHigh) {
          textureIntensity = 0.0;
        } 

        if (textureIntensity >= 0.5) {
          textureIntensity = textureIntensity * 2.56 * alphaCorrection * delta;
          color = vec4(textureIntensity, 0.0, 0.0, textureIntensity);
        } else {
          textureIntensity = textureIntensity * 2.56 * alphaCorrection * delta;
          color = vec4(textureIntensity, textureIntensity, textureIntensity, textureIntensity);
        }

        // adjust the color accumulation by some constant and alphaCorrection slider
        // multiply its by delta means that if the step size change, the accumulated color's range will still the same
        // multiply by (1.0 - accumulatedColor) the more color accumulated, the least its contribute to the final color
        // accumulatedColor += color * 2.56 * alphaCorrection * delta * (1.0 - accumulatedColor);
        accumulatedColor += color;

        // make a step
        accumulatedLength += deltaLength;
        currentPosition += deltaDirection;

        // early termination when the color is max and break when the finished
        if(accumulatedLength >= rayLength || accumulatedColor.a >= 1.0 )
						break;
      }

      gl_FragColor = accumulatedColor;














      // vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
      //         ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0);

      // // backPos is the worldSpaceCoords from the previous pass
      // vec3 backPos = texture2D(tex, texc).xyz;
      // vec3 frontPos = worldSpaceCoords;

      // if ((backPos.x == 0.0) && (backPos.y == 0.0))
      // {
      //   gl_FragColor = vec4(0.0);
      //   return;
      // }

      // vec3 dir = backPos - frontPos;

      // float rayLength = length(dir);

      // float delta = 1.0 / steps;

      // vec3 deltaDirection = normalize(dir) * delta;
      // float deltaDirectionLength = length(deltaDirection);

      // vec3 currentPosition = frontPos;
      // vec4 accumulatedColor = vec4(0.0);
      // float accumulatedAlpha = 0.0;
      // float accumulatedLength = 0.0;

      // vec4 color;
      // float alphaFactor;

      // for (int i = 0; i < 999; i++) {
      //   float textureIntensity = texture(cubeTex, currentPosition).r;

      //   textureIntensity = (contrast * textureIntensity) + brightness;

      //   if (textureIntensity >= colorTreshLow && textureIntensity <=  colorTreshHigh) {
      //     // if (texture(cubeTex2, currentPosition).r == 1.0) {
      //     //   color = vec4(1.0, 0.0, 0.0, textureIntensity);
      //     // } else {
      //     //   color = vec4(1.0, 1.0, 1.0, textureIntensity);
      //     // }
      //     color = vec4(1.0, 1.0, 1.0, textureIntensity);
      //   } else {
      //     color = vec4(0.0, 0.0, 0.0, 0.0);
      //   }
      
        
      //   accumulatedColor += color * delta * 25.6 * (1.0 - accumulatedColor.r) * alphaCorrection;


      //   currentPosition += deltaDirection;
      //   accumulatedLength += deltaDirectionLength;

      //   if(accumulatedLength >= rayLength || accumulatedColor.r >= 1.0 )
      //     break;
      // }

      // gl_FragColor = accumulatedColor;






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
