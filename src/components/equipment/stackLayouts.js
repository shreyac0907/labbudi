// The set-up layouts a drag step can build (a step names one with `parameters.layout`, default the Bunsen stack, and one
// of its pieces with `parameters.stack`). Each layout says where its pieces go, how big they are and how big their targets are.
import { stackPoint, STACK_SIZE, STACK_FOOT, STACK_Z } from './bunsenSetup';
import { microPoint, MICRO_SIZE, MICRO_FOOT, MICRO_Z } from './microscopeSetup';

const LAYOUTS = {
  bunsen: { point: stackPoint, size: STACK_SIZE, foot: STACK_FOOT, z: STACK_Z },
  microscope: { point: microPoint, size: MICRO_SIZE, foot: MICRO_FOOT, z: MICRO_Z },
};

export const layoutOf = (name = 'bunsen') => LAYOUTS[name] ?? LAYOUTS.bunsen;
