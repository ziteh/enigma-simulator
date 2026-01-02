import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Rotor(prop: { step?: number; onStepChange?: (delta: number) => void }) {
  const [step, setStep] = React.useState(prop.step || 0);

  const indexToChar = (step: number) => {
    return String.fromCharCode((step % 26) + 65); // A=65 in ASCII, 26 letters
  };

  React.useEffect(() => {
    if (prop.step !== undefined) {
      setStep(prop.step);
    }
  }, [prop.step]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={() => prop.onStepChange?.(1)}>▲</Button>

      <Badge>{indexToChar(step)}</Badge>

      <Button onClick={() => prop.onStepChange?.(-1)}>▼</Button>
    </div>
  );
}
