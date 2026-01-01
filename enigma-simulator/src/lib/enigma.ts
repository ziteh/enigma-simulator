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

const MAX_STEPS = 26;

const mod26 = (n: number) => ((n % MAX_STEPS) + MAX_STEPS) % MAX_STEPS;
const toIdx = (code: AsciiCode): number => code - AsciiCode.A;
const toCode = (idx: number): AsciiCode => (mod26(idx) + AsciiCode.A) as AsciiCode;

type Mapping = number[];

interface Rotor {
  forward: Mapping;
  backward: Mapping;
}

type RotorMap = Record<AsciiCode, AsciiCode>;
type PlugboardConfig = Map<AsciiCode, AsciiCode>;

export const createRotor = (rotorMap: RotorMap): Rotor => {
  if (Object.keys(rotorMap).length !== MAX_STEPS) {
    throw new Error(`Rotor map must have ${MAX_STEPS} mappings.`);
  }

  const forward: Mapping = new Array(MAX_STEPS);
  const backward: Mapping = new Array(MAX_STEPS);

  Object.entries(rotorMap).forEach(([key, val]) => {
    const k = toIdx(Number(key));
    const v = toIdx(val);
    forward[k] = v;
    backward[v] = k;
  });

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

const createReflector = (reflectorMap: RotorMap): number[] => {
  if (Object.keys(reflectorMap).length !== MAX_STEPS) {
    throw new Error(`Reflector map must have ${MAX_STEPS} mappings.`);
  }

  const reflector: number[] = new Array(MAX_STEPS);
  Object.entries(reflectorMap).forEach(([k, v]) => {
    reflector[toIdx(Number(k))] = toIdx(v);
  });
  return reflector;
};

export function enigmaHandleMessage(
  message: string,
  reflector: Record<AsciiCode, AsciiCode>,
  rotorConfigs: Rotor[],
  initialSteps: number[],
  plugConfig: Map<AsciiCode, AsciiCode> | null,
): string {
  let steps = [...initialSteps];
  const plugboard = createPlugboard(plugConfig);
  const reflectorTable = createReflector(reflector);

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

      // convert char to index
      const codeIndex = toIdx(code);

      // 1. through plugboard
      let signal = plugboard[codeIndex]!;

      // 2. through each rotor forward
      rotorConfigs.forEach((rotor, i) => {
        signal = transform(signal, rotor.forward, steps[i]!);
      });

      // 3. reflector
      signal = reflectorTable[signal]!;

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

export const RotorMapA: RotorMap = {
  [AsciiCode.A]: AsciiCode.E,
  [AsciiCode.B]: AsciiCode.J,
  [AsciiCode.C]: AsciiCode.D,
  [AsciiCode.D]: AsciiCode.K,
  [AsciiCode.E]: AsciiCode.S,
  [AsciiCode.F]: AsciiCode.I,
  [AsciiCode.G]: AsciiCode.R,
  [AsciiCode.H]: AsciiCode.U,
  [AsciiCode.I]: AsciiCode.X,
  [AsciiCode.J]: AsciiCode.B,
  [AsciiCode.K]: AsciiCode.L,
  [AsciiCode.L]: AsciiCode.H,
  [AsciiCode.M]: AsciiCode.W,
  [AsciiCode.N]: AsciiCode.T,
  [AsciiCode.O]: AsciiCode.M,
  [AsciiCode.P]: AsciiCode.C,
  [AsciiCode.Q]: AsciiCode.Q,
  [AsciiCode.R]: AsciiCode.G,
  [AsciiCode.S]: AsciiCode.Z,
  [AsciiCode.T]: AsciiCode.N,
  [AsciiCode.U]: AsciiCode.F,
  [AsciiCode.V]: AsciiCode.V,
  [AsciiCode.W]: AsciiCode.O,
  [AsciiCode.X]: AsciiCode.A,
  [AsciiCode.Y]: AsciiCode.Y,
  [AsciiCode.Z]: AsciiCode.P,
};

export const ReflectorMapA: RotorMap = {
  [AsciiCode.A]: AsciiCode.Y,
  [AsciiCode.B]: AsciiCode.R,
  [AsciiCode.C]: AsciiCode.U,
  [AsciiCode.D]: AsciiCode.H,
  [AsciiCode.E]: AsciiCode.Q,
  [AsciiCode.F]: AsciiCode.S,
  [AsciiCode.G]: AsciiCode.L,
  [AsciiCode.H]: AsciiCode.D,
  [AsciiCode.I]: AsciiCode.P,
  [AsciiCode.J]: AsciiCode.X,
  [AsciiCode.K]: AsciiCode.N,
  [AsciiCode.L]: AsciiCode.G,
  [AsciiCode.M]: AsciiCode.O,
  [AsciiCode.N]: AsciiCode.K,
  [AsciiCode.O]: AsciiCode.M,
  [AsciiCode.P]: AsciiCode.I,
  [AsciiCode.Q]: AsciiCode.E,
  [AsciiCode.R]: AsciiCode.B,
  [AsciiCode.S]: AsciiCode.F,
  [AsciiCode.T]: AsciiCode.Z,
  [AsciiCode.U]: AsciiCode.C,
  [AsciiCode.V]: AsciiCode.W,
  [AsciiCode.W]: AsciiCode.V,
  [AsciiCode.X]: AsciiCode.J,
  [AsciiCode.Y]: AsciiCode.A,
  [AsciiCode.Z]: AsciiCode.T,
};

export const PlugboardConfigA: PlugboardConfig = new Map([
  [AsciiCode.A, AsciiCode.B],
  [AsciiCode.Y, AsciiCode.J],
  [AsciiCode.H, AsciiCode.T],
]);
