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

const DEFAULT_ROTOR_STEPS = ["M".charCodeAt(0), "I".charCodeAt(0), "V".charCodeAt(0)].map(
  (c) => c - AsciiCode.A,
);

export default function App() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  const [rotorSteps, setRotorSteps] = React.useState(DEFAULT_ROTOR_STEPS);
  const [defaultRotorSteps, setDefaultRotorSteps] = React.useState(DEFAULT_ROTOR_STEPS);
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
    // setDefaultRotorSteps([0, 0, 0]);
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
    <div className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8 gap-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Enigma Simulator</h1>
        <p className="text-sm md:text-lg opacity-50 gap-2 flex flex-wrap items-center justify-center">
          <span>
            Configure your rotors, reflector, and plugboard, then type your message to encrypt or
            decrypt.
          </span>
          <HelpDialog />
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8">
        <div className="flex gap-4 flex-row-reverse items-center">
          {rotorSteps.map((s, i) => (
            <Card key={i} title={`Rotor ${i + 1}`} className="gap-4 py-4 w-full md:w-auto min-h-54">
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

          <Card title="Reflector" className="py-4 min-h-54">
            <div className="mx-2">
              <ReflectorDialog
                defaultConfig={0}
                currentConfig={reflectorConfig}
                onConfigChange={setReflectorConfig}
              />
            </div>
          </Card>
        </div>
        <div className="flex flex-row md:flex-col gap-4 flex-wrap justify-center lg:absolute lg:right-45">
          <Button variant="default" onClick={() => setDefaultRotorSteps(rotorSteps)}>
            Set Start Position
          </Button>
          <Button variant="default" onClick={() => setRotorSteps(defaultRotorSteps)}>
            Reset to Start
          </Button>
          <Button variant="secondary" onClick={() => resetRotorSteps()}>
            Reset to AAA
          </Button>
        </div>
      </div>

      <div className="w-full max-w-3xl px-4 md:px-0">
        <div className="mb-4 relative">
          <Textarea
            placeholder="Output (Ciphertext)"
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
            placeholder="Input (Plaintext)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-20 font-mono pr-20"
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

      <div className="-mt-3 max-w-2xl md:max-w-160">
        <Plugboard pairings={pairings} onPairingsChange={setPairings} />
      </div>
    </div>
  );
}
