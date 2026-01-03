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
import { createReflector, ReflectorUkwB, ReflectorUkwC } from "@/lib/enigma";

const configOptions = [
  { name: "B", config: ReflectorUkwB },
  { name: "C", config: ReflectorUkwC },
];

const DEFAULT_CONFIG_INDEX = 0;
const VALID_MESSAGE = "This is a valid custom reflector configuration.";
const DEFAULT_CUSTOM_CONFIG = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

export default function ReflectorDialog(prop: {
  defaultConfig?: number;
  currentConfig?: string;
  onConfigChange?: (config: string) => void;
}) {
  const [configName, setConfigName] = React.useState<string>(
    configOptions[DEFAULT_CONFIG_INDEX]!.name,
  );
  const [customConfig, setCustomConfig] = React.useState<string>(DEFAULT_CUSTOM_CONFIG);
  const [customConfigMessage, setCustomConfigMessage] = React.useState<string>(VALID_MESSAGE);
  const [selectedValue, setSelectedValue] = React.useState<string>(
    configOptions[DEFAULT_CONFIG_INDEX]!.config,
  );

  const [open, setOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (prop.currentConfig) {
      const found = configOptions.find((r) => r.config === prop.currentConfig);
      if (found) {
        setConfigName(found.name);
        setSelectedValue(found.config);
      } else {
        // custom
        setConfigName("#");
        setSelectedValue("custom");
        setCustomConfig(prop.currentConfig);
      }
    } else if (prop.defaultConfig !== undefined) {
      const found = configOptions.find((_r, index) => index === prop.defaultConfig);
      if (found) {
        setConfigName(found.name);
        setSelectedValue(found.config);
      }
    }
  }, [prop.defaultConfig, prop.currentConfig]);

  const handleCustomRotorChange = (value: string) => {
    value = value.toLocaleUpperCase().trim();
    try {
      createReflector(value);
      setCustomConfigMessage(VALID_MESSAGE);
    } catch (error) {
      if (error instanceof Error) {
        setCustomConfigMessage(error.message);
      }
    }
    setCustomConfig(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="font-mono text-xs">
          {configName}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-l">
        <DialogHeader>
          <DialogTitle>Edit reflector</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const config = formData.get("radios") as string;
            if (config === "custom") {
              prop.onConfigChange?.(customConfig);
              setConfigName("#");
            } else {
              prop.onConfigChange?.(config);
              setConfigName(configOptions.find((r) => r.config === config)!.name);
            }

            setOpen(false);
          }}
        >
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue} name="radios">
            {configOptions.map((rotor) => (
              <div className="flex items-center gap-3" key={rotor.name}>
                <RadioGroupItem value={rotor.config} id={rotor.name} />
                <Label htmlFor={rotor.name}>UKW-{rotor.name}</Label>
                <code className="font-mono opacity-50">{rotor.config}</code>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
              <Input
                placeholder={DEFAULT_CUSTOM_CONFIG}
                value={customConfig}
                onChange={(e) => handleCustomRotorChange(e.target.value)}
                title={customConfigMessage}
              />
            </div>
            <DialogDescription>{customConfigMessage}</DialogDescription>
          </RadioGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
