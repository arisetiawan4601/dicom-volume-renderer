import axios from "axios";
import { stackImages } from "./stackImages";

export const getData = async () => {
  let imageResponse;
  let segmentationResponse;
  try {
    segmentationResponse = await axios.get("http://localhost:3003/box");
    imageResponse = await axios.get("http://localhost:3003/scans2");
  } catch (error) {
    return undefined;
  }
  const imageStack = stackImages(imageResponse.data.stack);
  const segmentationStack = stackImages(segmentationResponse.data.stack);

  return {
    imageTexture: imageStack,
    imageStackLength: imageResponse.data.stack.length,
    imageLengthRatio: imageResponse.data.stackLengthRatio,
    segmentationTexture: segmentationStack,
    segmentationStackLength: segmentationResponse.data.stack.length,
    segmentationLengthRatio: segmentationResponse.data.stackLengthRatio,
  };
};
