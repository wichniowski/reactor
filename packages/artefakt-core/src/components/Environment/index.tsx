import React, { Component } from "react";
import Tone from "tone";
import Analyzer from "../legacy/ui/Analyzer";

interface EnvironmentProps {
  bpm: number;
  withAnalyzer?: boolean;
  audioContextRef?: (audioContext: any, masterGain: any) => void;
}

const audioContext = new AudioContext();
export const WebAudioContext = React.createContext({
  audioContext,
  master: {},
  aux: {},
});
class Environment extends Component<EnvironmentProps> {
  state = {};

  static defaultProps = {
    bpm: 130,
    withAnalyzer: false,
  };
  masterGain: GainNode;
  aux: GainNode;

  constructor(props: EnvironmentProps) {
    super(props);
    Tone.Transport.bpm.rampTo(props.bpm, 4);
    Tone.Transport.swing = 0;

    this.masterGain = audioContext.createGain();
    this.aux = audioContext.createGain();
    this.masterGain.gain.setValueAtTime(1, audioContext.currentTime);
    this.masterGain.connect(audioContext.destination);
    this.masterGain.connect(this.aux);

    if (props.audioContextRef) {
      props.audioContextRef(audioContext, this.masterGain);
    }
  }

  render() {
    const { children, withAnalyzer } = this.props;
    return (
      <React.Fragment>
        {withAnalyzer && (
          <Analyzer audioContext={audioContext} masterGain={this.masterGain} />
        )}
        <WebAudioContext.Provider
          value={{
            audioContext,
            master: { gain: this.masterGain },
            aux: this.aux,
          }}
        >
          {children}
        </WebAudioContext.Provider>
      </React.Fragment>
    );
  }
}

export default Environment;
