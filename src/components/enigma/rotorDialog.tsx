import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotorI, RotorII, RotorIII, RotorIV, RotorV, createRotor } from "@/lib/enigma";

const rotorOptions = [
  { name: "I", config: RotorI },
  { name: "II", config: RotorII },
  { name: "III", config: RotorIII },
  { name: "IV", config: RotorIV },
  { name: "V", config: RotorV },
];

const DEFAULT_ROTOR_INDEX = 0;

export default function RotorDialog(prop: {
  defaultConfig?: number;
  currentConfig?: string;
  onRotorChange?: (rotor: string) => void;
}) {
  const [configName, setConfigName] = React.useState<string>(
    rotorOptions[DEFAULT_ROTOR_INDEX]!.name,
  );
  const [customRotor, setCustomRotor] = React.useState<string>("EKMFLGDQVZNTOWYHXUSPAIBRCJ");
  const [customRotorMessage, setCustomRotorMessage] = React.useState<string>(
    "This is a valid custom rotor configuration.",
  );
  const [selectedValue, setSelectedValue] = React.useState<string>(
    rotorOptions[DEFAULT_ROTOR_INDEX]!.config,
  );

  const [open, setOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (prop.currentConfig) {
      const found = rotorOptions.find((r) => r.config === prop.currentConfig);
      if (found) {
        setConfigName(found.name);
        setSelectedValue(found.config);
      } else {
        // custom
        setConfigName("#");
        setSelectedValue("custom");
        setCustomRotor(prop.currentConfig);
      }
    } else if (prop.defaultConfig !== undefined) {
      const found = rotorOptions.find((_r, index) => index === prop.defaultConfig);
      if (found) {
        setConfigName(found.name);
        setSelectedValue(found.config);
      }
    }
  }, [prop.defaultConfig, prop.currentConfig]);

  const handleCustomRotorChange = (value: string) => {
    value = value.toLocaleUpperCase().trim();
    try {
      createRotor(value);
      setCustomRotorMessage("This is a valid custom rotor configuration.");
    } catch (error) {
      if (error instanceof Error) {
        setCustomRotorMessage(error.message);
      }
    }
    setCustomRotor(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{configName}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const rotorConfig = formData.get("radios") as string;
            if (rotorConfig === "custom") {
              prop.onRotorChange?.(customRotor);
              setConfigName("#");
            } else {
              prop.onRotorChange?.(rotorConfig);
              setConfigName(rotorOptions.find((r) => r.config === rotorConfig)!.name);
            }

            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit rotor</DialogTitle>
          </DialogHeader>
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue} name="radios">
            {rotorOptions.map((rotor) => (
              <div className="flex items-center gap-3" key={rotor.name}>
                <RadioGroupItem value={rotor.config} id={rotor.name} />
                <Label htmlFor={rotor.name}>Rotor {rotor.name}</Label>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <RadioGroupItem value="custom" id="r3" />
              <Label htmlFor="r3">Custom</Label>
              <Input
                placeholder="EKMFLGDQVZNTOWYHXUSPAIBRCJ"
                value={customRotor}
                onChange={(e) => handleCustomRotorChange(e.target.value)}
                title={customRotorMessage}
              />
            </div>
            <DialogDescription>{customRotorMessage}</DialogDescription>
          </RadioGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
