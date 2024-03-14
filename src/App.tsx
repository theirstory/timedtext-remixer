import React, { useState } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaDurationDisplay,
  MediaCaptionsButton,
  MediaMuteButton,
} from "media-chrome/dist/react";
import { createComponent } from "@lit/react";
import { TimedTextPlayer } from "../../timedtext-player/dist/timedtext-player.js";

import "./App.css";

const TimedTextPlayerComponent = createComponent({
  tagName: "timedtext-player",
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: "activate",
    onchange: "change",
  },
});

function App() {
  const [showPlayer, setShowPlayer] = useState(false);
  //
  return (
    <>
      <div>
        {showPlayer ? (
          <MediaController id="myController">
            <MediaControlBar style={{ width: "100%" }}>
              <MediaPlayButton></MediaPlayButton>
              <MediaMuteButton></MediaMuteButton>
              <MediaVolumeRange></MediaVolumeRange>
              <MediaTimeDisplay></MediaTimeDisplay>
              <MediaTimeRange></MediaTimeRange>
              <MediaDurationDisplay></MediaDurationDisplay>
              <MediaCaptionsButton></MediaCaptionsButton>
            </MediaControlBar>

            <TimedTextPlayerComponent
              slot="media"
              // transcript="#transcript"
              player="#video1"
              width={320}
            ></TimedTextPlayerComponent>
            {/* <timedtext-player
        slot="media"
        transcript="#transcript"
        player="#video1"
        width="320"
      ></timedtext-player> */}
          </MediaController>
        ) : (
          <button onClick={() => setShowPlayer(true)}>Show Player</button>
        )}
      </div>
      <div>
        <article id="transcript">
          <section
            data-t="2.65,50.669"
            data-media-src="https://s3-eu-west-1.amazonaws.com/files.hyperaud.io/tmp/NM-zWTU7X-k.mp4"
            data-player="#video1"
          >
            <div data-t="2.65,7" data-effect="#fin">
              Fade In effect
            </div>
            <div
              data-t="4,10"
              data-effect="#overlay"
              data-text="Richard Feynman"
            >
              overlay effect
            </div>

            <p data-t="2.65,50.669" data-speaker="Richard Feynman">
              <span data-t="2.65,2.869">Now,</span>{" "}
              <span data-t="2.88,3.47">another</span>{" "}
              <span data-t="3.48,3.9">thing</span>{" "}
              <span data-t="3.91,4.07">that</span>{" "}
              <span data-t="4.079,4.489">people</span>{" "}
              <span data-t="4.5,4.82">often</span>{" "}
              <span data-t="4.829,5.05">say</span>{" "}
              <span data-t="5.059,5.159">is</span>{" "}
              <span data-t="5.17,5.309">that</span>{" "}
              <span data-t="5.32,6.03">forgetting</span>{" "}
              <span data-t="6.849,7.159">two</span>{" "}
              <span data-t="7.17,7.829">identical</span>{" "}
              <span data-t="7.84,8.42">theories,</span>{" "}
              <span data-t="9.439,9.819">two</span>{" "}
              <span data-t="9.829,10.39">theories,</span>{" "}
              <span data-t="10.399,10.42">you</span>{" "}
              <span data-t="10.43,10.75">suppose</span>{" "}
              <span data-t="10.76,10.829">you</span>{" "}
              <span data-t="10.84,10.96">have</span>{" "}
              <span data-t="10.97,11.109">two</span>{" "}
              <span data-t="11.119,11.569">theories</span>{" "}
              <span data-t="11.579,11.63">A</span>{" "}
              <span data-t="11.64,11.859">and</span>{" "}
              <span data-t="11.869,12.18">B</span>{" "}
              <span data-t="13.51,13.85">which</span>{" "}
              <span data-t="13.859,14.01">look</span>{" "}
              <span data-t="14.02,14.479">completely</span>{" "}
              <span data-t="14.489,14.81">different</span>{" "}
              <span data-t="14.819,15.449">psychological</span>{" "}
              <span data-t="15.46,15.5">have</span>{" "}
              <span data-t="15.51,15.829">different</span>{" "}
              <span data-t="15.84,16.239">ideas</span>{" "}
              <span data-t="16.25,16.319">in</span>{" "}
              <span data-t="16.329,16.409">them</span>{" "}
              <span data-t="16.42,16.569">and</span>{" "}
              <span data-t="16.579,16.739">so</span>{" "}
              <span data-t="16.75,17.059">on.</span>{" "}
              <span data-t="17.319,17.579">But</span>{" "}
              <span data-t="17.59,17.69">that</span>{" "}
              <span data-t="17.7,17.969">all</span>{" "}
              <span data-t="17.979,18.049">the</span>{" "}
              <span data-t="18.059,18.819">consequences</span>{" "}
              <span data-t="18.829,18.93">that</span>{" "}
              <span data-t="18.94,18.979">are</span>{" "}
              <span data-t="18.989,19.76">computed,</span>{" "}
              <span data-t="20.01,20.34">all</span>{" "}
              <span data-t="20.35,20.43">the</span>{" "}
              <span data-t="20.44,21.09">consequences</span>{" "}
              <span data-t="21.1,21.129">of</span>{" "}
              <span data-t="21.139,21.159">the</span>{" "}
              <span data-t="21.17,21.889">computed</span>{" "}
              <span data-t="21.899,22.159">are</span>{" "}
              <span data-t="22.17,22.729">exactly</span>{" "}
              <span data-t="22.739,22.809">the</span>{" "}
              <span data-t="22.819,23.329">same.</span>{" "}
              <span data-t="23.659,23.899">May</span>{" "}
              <span data-t="23.979,24.19">say</span>{" "}
              <span data-t="24.2,24.319">they</span>{" "}
              <span data-t="24.329,24.54">even</span>{" "}
              <span data-t="24.549,24.84">agree</span>{" "}
              <span data-t="24.85,24.969">with</span>{" "}
              <span data-t="24.979,25.569">experiment</span>{" "}
              <span data-t="25.579,25.61">to</span>{" "}
              <span data-t="25.62,25.659">answer</span>{" "}
              <span data-t="26.549,26.69">the</span>{" "}
              <span data-t="26.7,27.02">point</span>{" "}
              <span data-t="27.03,27.219">is</span>{" "}
              <span data-t="27.229,27.29">though</span>{" "}
              <span data-t="27.299,27.53">that</span>{" "}
              <span data-t="27.54,27.62">the</span>{" "}
              <span data-t="27.629,27.85">two</span>{" "}
              <span data-t="27.86,28.309">theories,</span>{" "}
              <span data-t="28.319,28.52">although</span>{" "}
              <span data-t="28.53,28.729">they</span>{" "}
              <span data-t="28.739,29.03">sound</span>{" "}
              <span data-t="29.04,29.28">different</span>{" "}
              <span data-t="29.29,29.34">at</span>{" "}
              <span data-t="29.35,29.42">the</span>{" "}
              <span data-t="29.43,29.85">beginning,</span>{" "}
              <span data-t="29.879,30.25">have</span>{" "}
              <span data-t="30.26,30.43">all</span>{" "}
              <span data-t="30.44,31.17">consequences</span>{" "}
              <span data-t="31.18,31.26">the</span>{" "}
              <span data-t="31.27,31.59">same.</span>{" "}
              <span data-t="31.6,31.709">It's</span>{" "}
              <span data-t="31.719,31.989">easy</span>{" "}
              <span data-t="32,32.319">usually</span>{" "}
              <span data-t="32.33,32.45">to</span>{" "}
              <span data-t="32.459,32.83">prove</span>{" "}
              <span data-t="32.84,33.02">that</span>{" "}
              <span data-t="33.029,34.049">mathematically</span>{" "}
              <span data-t="34.06,34.34">by</span>{" "}
              <span data-t="34.349,34.599">doing</span>{" "}
              <span data-t="34.61,34.619">a</span>{" "}
              <span data-t="34.63,34.75">little</span>{" "}
              <span data-t="34.759,35.29">mathematics</span>{" "}
              <span data-t="35.299,35.52">ahead</span>{" "}
              <span data-t="35.529,35.569">of</span>{" "}
              <span data-t="35.58,35.849">time</span>{" "}
              <span data-t="35.86,35.919">to</span>{" "}
              <span data-t="35.93,36.22">show</span>{" "}
              <span data-t="36.229,36.38">that</span>{" "}
              <span data-t="36.389,36.49">the</span>{" "}
              <span data-t="36.5,36.93">logic</span>{" "}
              <span data-t="36.939,37.08">from</span>{" "}
              <span data-t="37.09,37.27">this</span>{" "}
              <span data-t="37.279,37.389">one</span>{" "}
              <span data-t="37.4,37.47">and</span>{" "}
              <span data-t="37.479,37.63">this</span>{" "}
              <span data-t="37.639,37.849">one</span>{" "}
              <span data-t="37.86,38.119">will</span>{" "}
              <span data-t="38.13,38.45">always</span>{" "}
              <span data-t="38.459,38.689">give</span>{" "}
              <span data-t="38.7,39.31">corresponding</span>{" "}
              <span data-t="39.319,39.9">consequences.</span>{" "}
              <span data-t="40.59,40.99">Suppose</span>{" "}
              <span data-t="41,41.11">we</span>{" "}
              <span data-t="41.119,41.229">have</span>{" "}
              <span data-t="41.24,41.43">two</span>{" "}
              <span data-t="41.439,41.689">such</span>{" "}
              <span data-t="41.7,41.939">theories.</span>{" "}
              <span data-t="41.95,42.04">How</span>{" "}
              <span data-t="42.049,42.099">are</span>{" "}
              <span data-t="42.11,42.15">we</span>{" "}
              <span data-t="42.159,42.27">going</span>{" "}
              <span data-t="42.279,42.33">to</span>{" "}
              <span data-t="42.34,42.689">decide</span>{" "}
              <span data-t="42.7,42.95">which</span>{" "}
              <span data-t="42.959,43.25">one</span>{" "}
              <span data-t="43.259,43.58">is</span>{" "}
              <span data-t="43.59,44.02">right?</span>{" "}
              <span data-t="44.45,44.729">No</span>{" "}
              <span data-t="44.74,45.13">way,</span>{" "}
              <span data-t="45.139,45.45">not</span>{" "}
              <span data-t="45.459,45.65">by</span>{" "}
              <span data-t="45.659,46.29">science</span>{" "}
              <span data-t="46.65,47.04">because</span>{" "}
              <span data-t="47.049,47.159">they</span>{" "}
              <span data-t="47.169,47.43">both</span>{" "}
              <span data-t="47.439,47.65">agree</span>{" "}
              <span data-t="47.659,47.77">with</span>{" "}
              <span data-t="47.779,48.31">experiment</span>{" "}
              <span data-t="48.319,48.349">to</span>{" "}
              <span data-t="48.36,48.439">the</span>{" "}
              <span data-t="48.45,48.669">same</span>{" "}
              <span data-t="48.68,49.049">extent,</span>{" "}
              <span data-t="49.06,49.189">there's</span>{" "}
              <span data-t="49.2,49.299">no</span>{" "}
              <span data-t="49.31,49.529">way</span>{" "}
              <span data-t="49.54,49.669">to</span>{" "}
              <span data-t="49.68,50.24">distinguish</span>{" "}
              <span data-t="50.25,50.389">one</span>{" "}
              <span data-t="50.4,50.59">from</span>{" "}
              <span data-t="50.599,50.669">me.</span>
            </p>
          </section>
        </article>
      </div>
    </>
  );
}

export default App;
