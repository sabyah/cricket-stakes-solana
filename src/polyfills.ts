/**
 * Must run before any code that uses Node builtins (e.g. Privy's Solana deps use buffer/bn.js).
 * Import this first in main.tsx so globalThis.Buffer is set before other chunks evaluate.
 */
import { Buffer } from "buffer";
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
