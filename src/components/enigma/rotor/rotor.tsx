import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAX_STEPS } from "@/lib/enigma";

export default function Rotor(prop: { step?: number; onStepChange?: (step: number) => void }) {
  const [step, setStep] = React.useState(prop.step || 0);

  React.useEffect(() => {
    if (prop.step !== undefined) {
      setStep(prop.step);
    }
  }, [prop.step]);

  React.useEffect(() => {
    prop.onStepChange?.(step);
  }, [step, prop]);

  return (
    <div>
      <Button onClick={() => setStep((prev) => (prev + 1) % MAX_STEPS)}>▲</Button>

      <Badge>{step + 1}</Badge>

      <Button onClick={() => setStep((prev) => (prev - 1 + MAX_STEPS) % MAX_STEPS)}>▼</Button>
    </div>
  );
}
