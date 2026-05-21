# FujiHub Mobile

Este é o **aplicativo mobile do FujiHub**, desenvolvido com **React Native + Expo**, responsável por oferecer a experiência nativa em **iOS** e **Android**, consumindo a API do backend (Django REST Framework).

---

## Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) para build e dev server
- [React Navigation](https://reactnavigation.org/) para navegação
- Fetch API para comunicação com o backend
- Expo Router para rotas

---

## Subindo o ambiente

Este projeto faz parte de um workspace com `backend`, `web`, `mobile` e `.devcontainer`.

O fluxo recomendado é:

1. Abrir a pasta raiz do workspace no VS Code.
2. Rodar **Dev Containers: Reopen in Container**.
3. Subir o backend em um terminal.
4. Subir o Expo em outro terminal.

Também é possível subir os containers manualmente a partir da raiz:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d --build
```

---

## Rodando o mobile

A partir da raiz do workspace, entre no container `mobile`:

```bash
docker compose -f .devcontainer/docker-compose.yml exec mobile bash
cd /workspace/mobile
npm install
npm run start
```

Se já estiver dentro do Dev Container ou rodando localmente:

```bash
cd /workspace/mobile
npm install
npm run start
```

O Expo vai mostrar as opções para abrir em:

- **Expo Go** (Android/iOS)
- **Android Emulator**
- **iOS Simulator**
- **Development Build**
- **Web**, usando `npm run web`

Portas usadas pelo Expo no Dev Container:

- `19000`
- `19001`
- `19002`

---

## Integração com o backend

- O backend deve estar rodando em `http://127.0.0.1:8000`.
- O mobile consome os endpoints da API, por exemplo:
  - `POST /api/token/` -> login (JWT)
  - `GET /api/profile/` -> dados do usuário autenticado

Para testar em celular físico com Expo Go, use o IP da sua máquina na rede em vez de `localhost`.

Exemplo:

```ts
const API_URL = 'http://192.168.0.10:8000';
```

No projeto atual, essa URL fica em:

```text
mobile/hooks/useAuth.ts
```

Para descobrir o IP da máquina:

```bash
hostname -I
```

Use o primeiro IP da sua rede local, normalmente algo como `192.168.x.x`.

---

## Scripts úteis

- `npm run start` -> inicia o servidor Expo
- `npm run android` -> abre no emulador Android
- `npm run ios` -> abre no simulador iOS
- `npm run web` -> roda versão web
- `npm run lint` -> roda o lint do Expo

---

## Estrutura de pastas

```text
mobile/
├── app/             # Rotas e telas (file-based routing do Expo Router)
├── assets/          # Ícones, imagens, fontes
├── components/      # Componentes reutilizáveis
├── constants/       # Constantes visuais e de app
├── hooks/           # Hooks, incluindo autenticação/API
├── scripts/
├── app.json
└── README.md
```

---

## Checklist rápido

- Backend rodando em `0.0.0.0:8000`.
- Celular e computador na mesma rede Wi-Fi.
- `API_URL` em `mobile/hooks/useAuth.ts` apontando para o IP correto da máquina.
- Expo iniciado com `npm run start`.

---

## Roadmap

- [ ] Integração completa com autenticação JWT
- [ ] Armazenamento seguro de tokens (SecureStore)
- [ ] Dashboard inicial conectado ao backend
- [ ] Tema visual unificado com branding FujiHub
- [ ] Deploy em lojas (Play Store / App Store)

---

## Licença

Este projeto é de uso interno do **FujiHub**.
