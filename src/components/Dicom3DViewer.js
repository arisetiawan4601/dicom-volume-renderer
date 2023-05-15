import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ReactSlider from "react-slider";
import {
  BackSide,
  BoxGeometry,
  ClampToEdgeWrapping,
  FloatType,
  FrontSide,
  ImageUtils,
  LinearFilter,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { Detector } from "../utils/detector";
import * as VolumeRendererUtils from "../utils/volumeRenderer";

const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: 18px;
  margin-bottom: 16px;
`;

const StyledThumb = styled.div`
  height: 18px;
  line-height: 18px;
  width: 18px;
  text-align: center;
  background-color: #ff00ff;
  color: #fff;
  border-radius: 50%;
  cursor: grab;
`;

const Thumb = (props, state) => (
  <StyledThumb {...props}>
    {/* {((state.valueNow / 100) * 255).toFixed(0)} */}
  </StyledThumb>
);

const StyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: ${(props) =>
    props.index === 2 ? "#fff" : props.index === 1 ? "#f00" : "#fff"};
  border-radius: 999px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;

const StyledContainer = styled.div`
  resize: horizontal;
  overflow: auto;
  width: 50%;
  max-width: 100%;
  padding-right: 8px;
`;

export const Dicom3DViewer = () => {
  const [animateReady, setAnimateReady] = useState(false);
  const [error, setError] = useState("");

  let colorTreshLow = 0.0;
  let colorTreshHigh = 1.0;
  let alphaCorrection = 2.0;
  let alpha = 1;
  let beta = 0;

  useEffect(() => {
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    const initFn = async () => {
      const status = await VolumeRendererUtils.init();
      if (status === "success") {
        setAnimateReady(true);
      } else {
        setError(status);
      }
    };
    initFn();
  }, []);

  useEffect(() => {
    if (animateReady) {
      console.log("ready");

      const animate = () => {
        requestAnimationFrame(animate);
        VolumeRendererUtils.render(
          colorTreshLow,
          colorTreshHigh,
          alphaCorrection,
          alpha,
          beta
        );
      };
      animate();
    } else {
      console.log("not ready");
    }
  }, [animateReady]);

  if (error !== "") {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div
        style={{
          position: "absolute",
          width: "300px",
          right: "16px",
        }}
      >
        {/* <input
          type="range"
          min={0}
          max={100}
          onChange={(e) => {
            colorTresh = e.target.value / 100;
          }}
        ></input> */}
        <p
          style={{
            color: "white",
          }}
        >
          Trimmer
        </p>
        <StyledSlider
          defaultValue={[0, 100]}
          renderTrack={Track}
          renderThumb={Thumb}
          onChange={(value) => {
            colorTreshLow = value[0] / 100;
            colorTreshHigh = value[1] / 100;
          }}
        />
        <p
          style={{
            color: "white",
          }}
        >
          Alpha Correction
        </p>
        <StyledSlider
          defaultValue={50}
          renderTrack={Track}
          renderThumb={Thumb}
          onChange={(value) => {
            console.log((value / 100) * 4);
            alphaCorrection = (value / 100) * 4;
          }}
        />
        <p
          style={{
            color: "white",
          }}
        >
          Alpha
        </p>
        <StyledSlider
          defaultValue={10}
          renderTrack={Track}
          renderThumb={Thumb}
          onChange={(value) => {
            alpha = (value / 100) * 10;
          }}
        />
        <p
          style={{
            color: "white",
          }}
        >
          Beta
        </p>
        <StyledSlider
          defaultValue={50}
          renderTrack={Track}
          renderThumb={Thumb}
          onChange={(value) => {
            beta = (value / 100) * 2 - 1.1;
          }}
        />
      </div>
      <div id="3d-view"></div>
    </div>
  );
};
