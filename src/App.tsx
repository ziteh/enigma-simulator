import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Rotor from "@/components/enigma/rotor";
import Plugboard from "@/components/enigma/plugboard";
import RotorDialog from "@/components/enigma/rotorDialog";
import ReflectorDialog from "@/components/enigma/reflector";
import HelpDialog from "@/components/helpDialog";

import {
  MAX_STEPS,
  enigmaHandleMessage,
  RotorI,
  RotorII,
  RotorIII,
  ReflectorUkwB,
  AsciiCode,
  type PlugboardConfig,
  createRotor,
  createReflector,
} from "@/lib/enigma";
import { Card } from "./components/ui/card";

export default function App() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  const [rotorSteps, setRotorSteps] = React.useState([0, 0, 0]);
  const [defaultRotorSteps, setDefaultRotorSteps] = React.useState([0, 0, 0]);
  const [previousInputLength, setPreviousInputLength] = React.useState(0);
  const [rotorConfigs, setRotorConfigs] = React.useState([RotorI, RotorII, RotorIII]);
  const [reflectorConfig, setReflectorConfig] = React.useState(ReflectorUkwB);

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
      createReflector(reflectorConfig),
      rotorConfigs.map((s) => createRotor(s)),
      startSteps,
      pairings,
      (steps: number[]) => {
        setRotorSteps(steps);
      },
    );
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
    <div className="flex min-h-svh flex-col items-center justify-center p-8 gap-5">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">Enigma Simulator</h1>
        <p className="text-lg text-gray-600 gap-2 flex items-center justify-center">
          <span>
            Setup your rotors, reflector, and plugboard, then type message to encrypt or decrypt.
          </span>
          <HelpDialog />
        </p>
      </div>

      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-4 flex-row-reverse">
          {rotorSteps.map((s, i) => (
            <Card key={i} title={`Rotor ${i + 1}`} className="gap-4 py-4">
              <div className="mx-4">
                <RotorDialog
                  defaultConfig={i}
                  currentConfig={rotorConfigs[i]}
                  onRotorChange={(r) => updateRotorConfig(i, r)}
                />
              </div>
              <Rotor step={s} onStepChange={(delta) => updateRotorSteps(i, delta)} />
            </Card>
          ))}

          <Card title="Reflector" className="py-4">
            <div className="mx-2">
              <ReflectorDialog
                defaultConfig={0}
                currentConfig={reflectorConfig}
                onConfigChange={setReflectorConfig}
              />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setDefaultRotorSteps(rotorSteps)}>Save Step</Button>
          <Button onClick={() => setRotorSteps(defaultRotorSteps)}>Load Step</Button>
          <Button onClick={() => resetRotorSteps()}>Reset Step</Button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <div className="mb-4 relative">
          <Textarea
            placeholder="Here is the output"
            value={output}
            readOnly
            className="min-h-20 focus-visible:ring-0 cursor-default resize-none border-none font-mono pr-20"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => {
              navigator.clipboard.writeText(output);
            }}
            aria-label="Copy output to clipboard"
          >
            Copy
          </Button>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Type your message here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono pr-20"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => {
              setInput("");
              setOutput("");
            }}
            aria-label="Clear input and output"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="-mt-3">
        <Plugboard pairings={pairings} onPairingsChange={setPairings} />
      </div>
    </div>
  );
}
