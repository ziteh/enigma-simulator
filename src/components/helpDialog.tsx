import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          title="Help"
          size="icon-sm"
          className="rounded-full"
          aria-label="Open help dialog"
        >
          ?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Guide</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          The Enigma machine is used to encrypt and decrypt messages.
          <br />
          <br />
          <strong>Setup: </strong>Select a set of rotors and their initial positions, a reflector,
          and plugboard pairings. This specific configuration is your "key".
          <br />
          <br />
          <strong>Encrypt/Decrypt: </strong>Type your message into the input area to see the result
          in the output. To decrypt, use the exact same configuration and type the encrypted
          message.
          <br />
          <br />
          <strong>Rotors: </strong>Perform letter mapping and rotate with each key press, which
          changes the mapping.
          <br />
          <br />
          <strong>Reflector: </strong>Reflects the signal back through the rotors. A letter never
          maps to itself.
          <br />
          <br />
          <strong>Plugboard: </strong>Swaps pairs of letters before and after the signal passes
          through the rotors and reflector.
          <br />
          <br />
          <strong>Signal Path: </strong>Input Letter → Plugboard → Rotors (in order) → Reflector →
          Rotors (reverse order) → Plugboard → Output Letter
          <br />
          <br />
          Ref:{" "}
          <a
            href="https://www.cryptomuseum.com/crypto/enigma/wiring.htm"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enigma Wiring
          </a>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
