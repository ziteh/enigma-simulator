import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Rotor(prop: { step?: number; onStepChange?: (delta: number) => void }) {
  const [step, setStep] = React.useState(prop.step || 0);
  const [direction, setDirection] = React.useState<"up" | "down" | null>(null);
  const prevStepRef = React.useRef(step);

  const indexToChar = (s: number) => {
    const n = 26;
    return String.fromCharCode((((s % n) + n) % n) + 65);
  };

  React.useEffect(() => {
    if (prop.step !== undefined) {
      const newStep = prop.step;
      if (newStep !== prevStepRef.current) {
        const diff = newStep - prevStepRef.current;

        // Detect direction (handling wrap-around)
        if (diff === 1 || diff === -25) {
          setDirection("up");
        } else if (diff === -1 || diff === 25) {
          setDirection("down");
        } else {
          setDirection(null);
        }

        setStep(newStep);
        prevStepRef.current = newStep;
      }
    }
  }, [prop.step]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => prop.onStepChange?.(1)}
        className="rounded-full"
        aria-label="Increase rotor step"
      >
        ▲
      </Button>

      <div className="relative h-8 w-16 overflow-hidden">
        <div
          key={step}
          className={`absolute top-0 left-0 w-full h-[300%] flex flex-col
            ${direction === "up" ? "animate-slide-up" : ""}
            ${direction === "down" ? "animate-slide-down" : ""}
          `}
          style={{
            transform: "translateY(-33.33%)",
          }}
        >
          <div className="flex-1 flex items-center justify-center">
            <Badge
              className="font-mono rounded-sm opacity-70 scale-90"
              aria-label="Previous rotor step"
            >
              {indexToChar(step - 1)}
            </Badge>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Badge className="font-mono rounded-sm" aria-label="Current rotor step">
              {indexToChar(step)}
            </Badge>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Badge
              className="font-mono rounded-sm opacity-70 scale-90"
              aria-label="Next rotor step"
            >
              {indexToChar(step + 1)}
            </Badge>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => prop.onStepChange?.(-1)}
        className="rounded-full"
        aria-label="Decrease rotor step"
      >
        ▼
      </Button>

      <style>{`
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(0%); }
          to { transform: translateY(-33.33%); }
        }
        @keyframes slide-down {
          from { transform: translateY(-66.66%); }
          to { transform: translateY(-33.33%); }
        }
      `}</style>
    </div>
  );
}
