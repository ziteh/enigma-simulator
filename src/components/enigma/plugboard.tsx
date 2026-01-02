import React, { type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";

function RenderSlot(prop: {
  pairings: Map<string, string>;
  selected: string | null;
  onClick: (char: string) => void;
}): Array<JSX.Element> {
  const elements: Array<JSX.Element> = [];
  const paired = new Set<string>();
  prop.pairings.forEach((val, key) => {
    paired.add(key);
    paired.add(val);
  });

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    const isPaired = paired.has(char);
    const isSelected = prop.selected === char;
    elements.push(
      <div key={i}>
        <Button
          disabled={isPaired}
          variant={isSelected ? "outline" : "default"}
          onClick={() => prop.onClick(char)}
        >
          {char}
        </Button>
      </div>,
    );
  }
  return elements;
}

export default function Plugboard(prop: { pairings?: Map<string, string> }) {
  const [firstSelection, setFirstSelection] = React.useState<string | null>(null);

  const [pairings, setPairings] = React.useState<Map<string, string>>(
    prop.pairings ||
      new Map([
        ["A", "B"],
        ["C", "D"],
      ]),
  );

  const handleSlotClick = (char: string) => {
    if (firstSelection === null) {
      setFirstSelection(char);
    } else {
      if (firstSelection !== char) {
        addPairing(firstSelection, char);
      }
      setFirstSelection(null);
    }
  };

  const addPairing = (a: string, b: string) => {
    const newPairings = new Map(pairings);
    newPairings.set(a, b);
    setPairings(newPairings);
  };

  const deletePairing = (a: string, b: string) => {
    const newPairings = new Map(pairings);
    newPairings.delete(a);
    newPairings.delete(b);
    setPairings(newPairings);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from(pairings.entries()).map(([a, b], i) => (
          <div key={i}>
            <Badge>
              {a}↔{b}
              <Button size="icon" onClick={() => deletePairing(a, b)}>
                ✕
              </Button>
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-9 gap-2">
        <RenderSlot pairings={pairings} selected={firstSelection} onClick={handleSlotClick} />
      </div>
    </div>
  );
}
