import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Rotor from "@/components/enigma/rotor/rotor";

import {
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
  const [previousInputLength, setPreviousInputLength] = React.useState(0);

  const onStepChange = (index: number, step: number) => {
    const newSteps = [...rotorSteps];
    newSteps[index] = step;
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
      setRotorSteps([0, 0, 0]);
      const newResult = enigmaHandle(input, [0, 0, 0]);
      setOutput(newResult);
    }

    setPreviousInputLength(input.length);
  }, [input, previousInputLength, rotorSteps]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-8 gap-4">
      <Rotor step={rotorSteps[0]} onStepChange={(step) => onStepChange(0, step)} />
      <Rotor step={rotorSteps[1]} onStepChange={(step) => onStepChange(1, step)} />
      <Rotor step={rotorSteps[2]} onStepChange={(step) => onStepChange(2, step)} />
      <Textarea
        placeholder="Type your message here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Textarea placeholder="Here is the output" value={output} readOnly />
      <Button>Click me</Button>
    </div>
  );
}
