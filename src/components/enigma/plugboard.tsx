import React, { type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, MoveHorizontal } from "lucide-react";
import { AsciiCode, type PlugboardConfig } from "@/lib/enigma";

function RenderSlot(prop: {
  pairings: PlugboardConfig;
  selected: string | null;
  onClick: (char: string) => void;
}): Array<JSX.Element> {
  const elements: Array<JSX.Element> = [];
  const paired = new Set<AsciiCode>();
  prop.pairings.forEach((val, key) => {
    paired.add(key);
    paired.add(val);
  });

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    const charCode = (65 + i) as AsciiCode;
    const isPaired = paired.has(charCode);
    const isSelected = prop.selected === char;
    elements.push(
      <div key={i}>
        <Button
          disabled={isPaired}
          size="icon-lg"
          variant={isSelected ? "default" : "secondary"}
          onClick={() => prop.onClick(char)}
          className="font-mono"
          aria-label={`Plugboard slot for letter ${char}`}
        >
          {char}
        </Button>
      </div>,
    );
  }
  return elements;
}

export default function Plugboard(prop: {
  pairings: PlugboardConfig;
  onPairingsChange: (pairings: PlugboardConfig) => void;
}) {
  const [firstSelection, setFirstSelection] = React.useState<string | null>(null);
  const { pairings, onPairingsChange } = prop;

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
    const aCode = a.charCodeAt(0) as AsciiCode;
    const bCode = b.charCodeAt(0) as AsciiCode;
    newPairings.set(aCode, bCode);
    onPairingsChange(newPairings);
  };

  const deletePairing = (a: string, b: string) => {
    const newPairings = new Map(pairings);
    const aCode = a.charCodeAt(0) as AsciiCode;
    const bCode = b.charCodeAt(0) as AsciiCode;
    newPairings.delete(aCode);
    newPairings.delete(bCode);
    onPairingsChange(newPairings);
  };

  return (
    <>
      <ScrollArea className="w-xl rounded-md whitespace-nowrap mb-2">
        <div className="flex w-max gap-2 p-4 min-h-18">
          {pairings.size === 0 && (
            <span className="text-muted-foreground italic text-sm">No pairings configured</span>
          )}
          {Array.from(pairings.entries()).map(([a, b], i) => (
            <div key={i} className="font-mono shrink-0">
              <Badge variant="default">
                {String.fromCharCode(a)}
                <MoveHorizontal />
                {String.fromCharCode(b)}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deletePairing(String.fromCharCode(a), String.fromCharCode(b))}
                  className="rounded-full"
                  aria-label={`Delete pairing ${String.fromCharCode(a)}-${String.fromCharCode(b)}`}
                >
                  <X />
                </Button>
              </Badge>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-13 gap-2">
        <RenderSlot pairings={pairings} selected={firstSelection} onClick={handleSlotClick} />
      </div>
    </>
  );
}
