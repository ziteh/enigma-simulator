import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

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

  const enigmaHandle = (input: string) => {
    const rotorA = createRotor(RotorMapA);
    const myRotors = [rotorA, rotorA, rotorA];
    const initialSteps = [0, 0, 0];

    const result = enigmaHandleMessage(
      input,
      ReflectorMapA,
      myRotors,
      initialSteps,
      PlugboardConfigA,
    );
    console.debug("Result:", result);
    return result;
  };

  React.useEffect(() => {
    const result = enigmaHandle(input);
    setOutput(result);
  }, [input]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-8 gap-4">
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
