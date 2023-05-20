export const stackImages = (stack) => {
  const sizeX = stack.length;
  const sizeY = stack[0].length;
  const sizeZ = stack[0][0].length;

  const stackBuffer = new Uint8Array(sizeX * sizeY * sizeZ);
  let i = 0;
  for (let z = 0; z < sizeZ; z++) {
    for (let y = 0; y < sizeY; y++) {
      for (let x = 0; x < sizeX; x++) {
        stackBuffer[i] = stack[x][y][z];
        i++;
      }
    }
  }
  return stackBuffer;
};
