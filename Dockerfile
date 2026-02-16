# Deploy do site deco.cx (documentação: https://docs.deco.cx/en/self-host/site)
FROM denoland/deno:alpine-1.46.3

EXPOSE 8000

WORKDIR /app

RUN mkdir -p /home/deno && chown -R deno:deno /home/deno && mkdir /app/deno && chown -R deno:deno /app && mkdir -p /deno-dir && chown -R deno:deno /deno-dir

USER deno

COPY --chown=deno:deno . deco

WORKDIR /app/deco

RUN echo -e 'import "$fresh/src/build/deps.ts";\nimport "$fresh/src/runtime/entrypoints/main.ts";\nimport "$fresh/src/runtime/entrypoints/deserializer.ts";\nimport "$fresh/src/runtime/entrypoints/signals.ts";' >> _docker_deps.ts

# Gera manifest e assets (_fresh/) necessários em produção
RUN deno run -A --unstable dev.ts build

RUN deno cache --allow-scripts -A main.ts dev.ts _docker_deps.ts

ARG GIT_REVISION=1

ENV DECO_SITE_NAME=orgulho-tech

ENV DENO_DEPLOYMENT_ID=$GIT_REVISION

CMD ["run", "--cached-only", "-A", "--unstable-kv", "main.ts"]
