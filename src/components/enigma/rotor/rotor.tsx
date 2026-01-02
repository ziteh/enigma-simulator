import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Rotor(prop: { step?: number; onStepChange?: (step: number) => void }) {
  const [step, setStep] = React.useState(prop.step || 0);

  React.useEffect(() => {
    if (prop.step !== undefined) {
      setStep(prop.step);
    }
  }, [prop.step]);

  return (
    <div>
      <Button onClick={() => prop.onStepChange?.(1)}>▲</Button>

      <Badge>{step + 1}</Badge>

      <Button onClick={() => prop.onStepChange?.(-1)}>▼</Button>
    </div>
  );
}
