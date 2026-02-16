/**
 * Stub da configuração de observabilidade do deco.cx.
 * Usado no Deno Deploy, onde a telemetria nativa (DenoRuntimeInstrumentation)
 * não é compatível (apenas valueType: DOUBLE é suportado).
 * Este arquivo não registra instrumentações e exporta implementações no-op.
 */
import * as log from "std/log/mod.ts";

export const OTEL_IS_ENABLED = false;

export const resource = {
  attributes: {} as Record<string, unknown>,
  merge: () => resource,
};

export const logger = new log.Logger("deco-logger", "INFO", {
  handlers: [new log.handlers.ConsoleHandler("INFO")],
});

const noopSpan = {
  end: () => {},
  setAttribute: () => {},
  setStatus: () => {},
  recordException: () => {},
};

export const tracer = {
  startSpan: () => noopSpan,
  startActiveSpan: (_name: string, _opts: unknown, fn: (span: typeof noopSpan) => void) => {
    fn(noopSpan);
    return noopSpan;
  },
};

export const tracerIsRecording = () => false;
