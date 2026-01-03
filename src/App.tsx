import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Rotor from "@/components/enigma/rotor/rotor";
import Plugboard from "@/components/enigma/plugboard";
import RotorDialog from "@/components/enigma/rotorDialog";

import {
  MAX_STEPS,
  enigmaHandleMessage,
  RotorI,
  RotorII,
  RotorIII,
  RotorIV,
  RotorV,
  ReflectorUkwB,
  AsciiCode,
  type PlugboardConfig,
  createRotor,
} from "@/lib/enigma";
import { Card } from "./components/ui/card";

export default function App() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  const [rotorSteps, setRotorSteps] = React.useState([0, 0, 0]);
  const [defaultRotorSteps, setDefaultRotorSteps] = React.useState([0, 0, 0]);
  const [previousInputLength, setPreviousInputLength] = React.useState(0);
  const [rotorConfigs, setRotorConfigs] = React.useState([RotorI, RotorII, RotorIII]);

  const [pairings, setPairings] = React.useState<PlugboardConfig>(
    new Map([
      [AsciiCode.E, AsciiCode.T],
      [AsciiCode.G, AsciiCode.O],
    ]),
  );

  const resetRotorSteps = () => {
    setRotorSteps([0, 0, 0]);
    setDefaultRotorSteps([0, 0, 0]);
  };

  const updateRotorSteps = (index: number, delta: number) => {
    const newSteps = [...rotorSteps];
    newSteps[index] = (newSteps[index] + delta + MAX_STEPS) % MAX_STEPS;
    setRotorSteps(newSteps);
  };

  const updateRotorConfig = (index: number, config: string) => {
    const newConfigs = [...rotorConfigs];
    newConfigs[index] = config;
    setRotorConfigs(newConfigs);
  };

  const enigmaHandle = (newInput: string, startSteps: number[]) => {
    const result = enigmaHandleMessage(
      newInput,
      ReflectorUkwB,
      rotorConfigs.map((s) => createRotor(s)),
      startSteps,
      pairings,
      (steps: number[]) => {
        setRotorSteps(steps);
      },
    );
    console.debug("Result:", result);
    return result;
  };

  React.useEffect(() => {
    // only process the new characters
    const newCharCount = input.length - previousInputLength;

    if (newCharCount > 0) {
      // new input added
      const newChars = input.slice(previousInputLength);
      const newResult = enigmaHandle(newChars, rotorSteps);
      setOutput((prev) => prev + newResult);
    } else if (newCharCount < 0) {
      // input was deleted, reset everything
      setRotorSteps(defaultRotorSteps);
      const newResult = enigmaHandle(input, defaultRotorSteps);
      setOutput(newResult);
    }

    setPreviousInputLength(input.length);
  }, [defaultRotorSteps, input, previousInputLength, rotorSteps]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-8 gap-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Enigma Simulator</h1>
        <p className="text-lg text-gray-600">
          Setup your rotors and plugboard, then type message to encrypt or decrypt.
        </p>
      </div>

      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-4 flex-row-reverse">
          {rotorSteps.map((s, i) => (
            <Card key={i}>
              <div className="mx-2 flex justify-between items-center">
                <RotorDialog defaultConfig={i} onRotorChange={(r) => updateRotorConfig(i, r)} />
              </div>
              <Rotor step={s} onStepChange={(delta) => updateRotorSteps(i, delta)} />
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setDefaultRotorSteps(rotorSteps)}>Save Step</Button>
          <Button onClick={() => setRotorSteps(defaultRotorSteps)}>Load Step</Button>
          <Button onClick={() => resetRotorSteps()}>Reset Step</Button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <div className="mb-4 flex flex-row gap-2">
          <Textarea placeholder="Here is the output" value={output} readOnly />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(output);
            }}
          >
            Copy
          </Button>
        </div>
        <div className="mb-4 flex flex-row gap-2">
          <Textarea
            placeholder="Type your message here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={() => {
              setInput("");
              setOutput("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <Plugboard pairings={pairings} onPairingsChange={setPairings} />
    </div>
  );
}
