import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Rotor from "@/components/enigma/rotor/rotor";
import Plugboard from "@/components/enigma/plugboard";

import {
  MAX_STEPS,
  enigmaHandleMessage,
  createRotor,
  RotorMapA,
  ReflectorMapA,
  PlugboardConfigA,
} from "@/lib/enigma";

export default function App() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  const [rotorSteps, setRotorSteps] = React.useState([0, 0, 0]);
  const [defaultRotorSteps, setDefaultRotorSteps] = React.useState([0, 0, 0]);
  const [previousInputLength, setPreviousInputLength] = React.useState(0);

  const [pairings, setPairings] = React.useState<Map<string, string>>(
    new Map([
      ["E", "T"],
      ["G", "O"],
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

  const enigmaHandle = (newInput: string, startSteps: number[]) => {
    const rotorA = createRotor(RotorMapA);
    const myRotors = [rotorA, rotorA, rotorA];

    const result = enigmaHandleMessage(
      newInput,
      ReflectorMapA,
      myRotors,
      startSteps,
      PlugboardConfigA,
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
      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-4 flex-row-reverse">
          {rotorSteps.map((s, i) => (
            <Rotor key={i} step={s} onStepChange={(delta) => updateRotorSteps(i, delta)} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setDefaultRotorSteps(rotorSteps)}>Save Step</Button>
          <Button onClick={() => setRotorSteps(defaultRotorSteps)}>Load Step</Button>
          <Button onClick={() => resetRotorSteps()}>Reset Step</Button>
        </div>
      </div>

      <Textarea
        placeholder="Type your message here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Textarea placeholder="Here is the output" value={output} readOnly />

      <Plugboard pairings={pairings} onPairingsChange={setPairings} />
    </div>
  );
}
