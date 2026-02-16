# Deploy do site Orgulho Tech (deco.cx)

Este projeto pode ser publicado de graça de quatro formas:

---

## 1. Vercel (build estático)

Este repositório agora possui exportação estática automática para Vercel.

1. Crie e publique uma branch de deploy (exemplo):

```bash
git checkout -b codex/vercel-static-export
git add .
git commit -m "chore: preparar deploy na vercel"
git push -u origin codex/vercel-static-export
```

2. No painel da Vercel, importe o repositório e selecione a branch.
3. A Vercel usará automaticamente o arquivo `vercel.json`:
   - instala Deno;
   - roda `deno task export:vercel`;
   - publica a pasta `dist/`.

Sempre que houver novo push na branch configurada, um novo deploy será gerado.

---

## 2. Deno Deploy (recomendado, gratuito)

1. Acesse [deno.com/deploy](https://deno.com/deploy) e faça login (pode ser com GitHub).
2. **Create Project** → **Import from GitHub** e selecione o repositório `orgulho-tech`.
3. Configuração:
   - **Entrypoint:** `main.ts`
   - **Build command:** `deno task build`
   - **Environment variables (se necessário):**  
     `DECO_SITE_NAME` = `orgulho-tech`
4. Salve e faça o deploy. O site ficará em `https://<nome-do-projeto>.deno.dev`.

Cada push na branch configurada (ex.: `main`) gera um novo deploy automaticamente.

---

## 3. Docker (qualquer provedor)

O `Dockerfile` na raiz segue a [documentação do deco.cx](https://docs.deco.cx/en/self-host/site).

**Build e execução local:**

```bash
docker build -t orgulho-tech .
docker run -p 8000:8000 orgulho-tech
```

Acesse `http://localhost:8000`.

**Publicar:** use o mesmo `Dockerfile` em serviços como **Railway**, **Render** ou **Fly.io** (todos têm plano gratuito). Conecte o repositório e configure para build via Docker.

---

## 4. Deco.cx (se o site foi criado no deco.cx)

Se este repositório foi criado a partir de um site no deco.cx:

1. Rode localmente: `deno task start`
2. Abra o site e pressione **`.`** (ponto) para abrir o editor.
3. No painel do deco.cx, procure a opção **“Go live”** ou **Deploy** para publicar no ambiente deles (ex.: `*.deno.dev`).

---

## Observações

- O **build** (`deno task build`) gera o manifest e os assets em `_fresh/`. No Deno Deploy isso é feito automaticamente pelo **Build command**.
- Para produção, o runtime usa **Deno KV** (`--unstable-kv`). No Docker isso já está no `CMD` do `Dockerfile`; no Deno Deploy o KV é suportado por padrão.
