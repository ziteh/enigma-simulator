export enum AsciiCode {
  A = 65,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
}

export const MAX_STEPS = 26;

const mod26 = (n: number) => ((n % MAX_STEPS) + MAX_STEPS) % MAX_STEPS;
const toIdx = (code: AsciiCode): number => code - AsciiCode.A;
const toCode = (idx: number): AsciiCode => (mod26(idx) + AsciiCode.A) as AsciiCode;

type Mapping = number[];

interface Rotor {
  forward: Mapping;
  backward: Mapping;
}

export type RotorMap = Record<AsciiCode, AsciiCode>;
export type PlugboardConfig = Map<AsciiCode, AsciiCode>;

export const createRotor = (mapping: string): Rotor => {
  if (mapping.length !== MAX_STEPS) {
    throw new Error(
      `Rotor mapping string must be ${MAX_STEPS} characters, but got: ` + mapping.length,
    );
  }

  const forward: Mapping = new Array(MAX_STEPS);
  const backward: Mapping = new Array(MAX_STEPS);

  for (let i = 0; i < MAX_STEPS; i++) {
    const charCode = mapping.charCodeAt(i);
    if (charCode < AsciiCode.A || charCode > AsciiCode.Z) {
      throw new Error(
        "Rotor mapping must contain only A-Z characters but got: " +
          String.fromCharCode(charCode) +
          " (" +
          (i + 1) +
          ")",
      );
    }
    const fromIdx = i;
    const to = toIdx(charCode as AsciiCode);
    forward[fromIdx] = to;
    backward[to] = fromIdx;
  }

  return { forward, backward };
};

const transform = (idx: number, mapping: Mapping, step: number): number => {
  const inputWithStep = mod26(idx + step);
  const output = mapping[inputWithStep]!;
  return mod26(output - step);
};

const createPlugboard = (config: Map<AsciiCode, AsciiCode> | null): number[] => {
  const board = Array.from({ length: MAX_STEPS }, (_, i) => i);
  if (config) {
    config.forEach((val, key) => {
      const a = toIdx(key);
      const b = toIdx(val);
      board[a] = b;
      board[b] = a;
    });
  }
  return board;
};

const stepping = (steps: number[]): number[] => {
  const newSteps = [...steps];
  for (let i = 0; i < newSteps.length; i++) {
    newSteps[i] = mod26(newSteps[i]! + 1);

    // if not full rotation, stop here
    // else continue to next rotor
    if (newSteps[i] !== 0) {
      break;
    }
  }
  return newSteps;
};

export const createReflector = (mapping: string): number[] => {
  if (mapping.length !== MAX_STEPS) {
    throw new Error(
      `Reflector mapping string must be ${MAX_STEPS} characters, but got: ` + mapping.length,
    );
  }

  const reflector: number[] = new Array(MAX_STEPS);
  for (let i = 0; i < MAX_STEPS; i++) {
    const charCode = mapping.charCodeAt(i);
    if (charCode < AsciiCode.A || charCode > AsciiCode.Z) {
      throw new Error(
        "Reflector mapping must contain only A-Z characters but got: " +
          String.fromCharCode(charCode) +
          " (" +
          (i + 1) +
          ")",
      );
    }
    reflector[i] = toIdx(charCode as AsciiCode);
  }

  // Validate reflector mappings are reciprocal and no character maps to itself
  for (let i = 0; i < MAX_STEPS; i++) {
    const target = reflector[i];
    const i2c = (n: number) => String.fromCharCode(n + AsciiCode.A);

    if (reflector[target] !== i) {
      throw new Error(
        `Reflector mapping is not reciprocal: ${i2c(i)} -> ${i2c(target)} but ${i2c(target)} -> ${i2c(reflector[target])}`,
      );
    }
    if (target === i) {
      throw new Error(`Reflector mapping cannot map a character to itself: ${i2c(i)}`);
    }
  }

  return reflector;
};

export function enigmaHandleMessage(
  message: string,
  reflector: number[],
  rotorConfigs: Rotor[],
  initialSteps: number[],
  plugConfig: Map<AsciiCode, AsciiCode> | null,
  stepCallback?: (steps: number[]) => void,
): string {
  let steps = [...initialSteps];
  const plugboard = createPlugboard(plugConfig);

  // process each character
  return message
    .toUpperCase()
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < AsciiCode.A || code > AsciiCode.Z) {
        return char; // non-ascii are not transformed
      }

      // rotate rotors
      steps = stepping(steps);
      stepCallback?.(steps);

      // convert char to index
      const codeIndex = toIdx(code);

      // 1. through plugboard
      let signal = plugboard[codeIndex]!;

      // 2. through each rotor forward
      rotorConfigs.forEach((rotor, i) => {
        signal = transform(signal, rotor.forward, steps[i]!);
      });

      // 3. reflector
      signal = reflector[signal]!;

      // 4. through each rotor backward
      for (let i = rotorConfigs.length - 1; i >= 0; i--) {
        const rotor = rotorConfigs[i]!;
        signal = transform(signal, rotor.backward, steps[i]!);
      }

      // 5. back through plugboard
      signal = plugboard[signal]!;

      // convert index back to char
      return String.fromCharCode(toCode(signal));
    })
    .join("");
}

export const RotorI = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
export const RotorII = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
export const RotorIII = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
export const RotorIV = "ESOVPZJAYQUIRHXLNFTGKDCMWB";
export const RotorV = "VZBRGITYUPSDNHLXAWMJQOFECK";

export const ReflectorUkwB = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
export const ReflectorUkwC = "FVPJIAOYEDRZXWGCTKUQSBNMHL";

export const PlugboardConfigA: PlugboardConfig = new Map([
  [AsciiCode.A, AsciiCode.B],
  [AsciiCode.Y, AsciiCode.J],
  [AsciiCode.H, AsciiCode.T],
]);
