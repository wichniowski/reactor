import React, { Component } from "react";
import Tone from "tone";
import { ChannelContext } from "../ChannelStrip";

interface SequencerProps {
  notes: Array<number | string>;
  stepDurations?: Array<number | string>;
  stepVelocities?: Array<number | string>;
  automation?: { [key: string]: Array<number> };
  interval: string;
}

// Todo: Fix step type
export interface ISequencerContext {
  onStep: (step: any) => {};
  audioContext: AudioContext;
  master: GainNode;
}

export const SequencerContext = React.createContext({
  onStep: (step: any) => {},
  audioContext: null,
  master: null
});

class Sequencer extends Component<SequencerProps> {
  static contextType = ChannelContext;
  static defaultProps = {
    interval: "4n"
  };
  transport: any;

  note = 100;
  clockCount = 0;

  componentDidMount() {
    Tone.Transport.start();
  }

  getStepProperty = (
    prop: (string | number)[] | undefined,
    stepNumber: number
  ) => {
    if (prop) {
      const step = prop[stepNumber];
      return step;
    } else {
      return undefined;
    }
  };

  getAutomation = () => {
    if (this.props.automation) {
      return Object.keys(this.props.automation)
        .map(key => {
          return {
            [key]:
              (this.props.automation &&
                this.props.automation[key][this.clockCount]) ||
              0
          };
        })
        .reduce((cur, prev) => {
          return {
            ...cur,
            ...prev
          };
        }, {});
    }
  };

  onStep = (callback: (step: any) => void) => {
    if (this.transport) {
      Tone.Transport.clear(this.transport);
    }
    this.transport = Tone.Transport.scheduleRepeat(
      () => {
        this.clockCount =
          this.clockCount + 1 < this.props.notes.length
            ? this.clockCount + 1
            : 0;
        if (callback) {
          callback({
            note: this.getStepProperty(this.props.notes, this.clockCount),
            automation: this.getAutomation(),
            duration: this.getStepProperty(
              this.props.stepDurations,
              this.clockCount
            ),
            velocity: this.getStepProperty(
              this.props.stepVelocities,
              this.clockCount
            )
          });
        }
      },
      this.props.interval,
      "1m"
    );
  };

  componentWillUnmount() {
    Tone.Transport.clear(this.transport);
  }

  render() {
    return (
      <SequencerContext.Provider
        value={{
          onStep: (step: any) => this.onStep(step),
          audioContext: this.context.audioContext,
          master: this.context.master
        }}
      >
        {this.props.children}
      </SequencerContext.Provider>
    );
  }
}

Sequencer.defaultProps = {
  interval: "4n"
};

export default Sequencer;
