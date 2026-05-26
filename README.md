# FujiHub Mobile

Base mobile do FujiHub com Expo, apontando para API de produção.

## Requisitos

- Node.js + npm
- Expo CLI (via `npx expo`)
- Backend FujiHub disponível em `https://api.emilioeiji.com.br`

## Configuração de ambiente

Use variável pública do Expo:

```bash
EXPO_PUBLIC_API_URL=https://api.emilioeiji.com.br
```

Para rodar no celular via LAN (devcontainer/Docker), informe também o host do Metro:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.140 \
EXPO_PUBLIC_API_URL=https://api.emilioeiji.com.br \
npx expo start --host lan --clear
```

Opção por arquivo `.env`:

```bash
cp .env.example .env
```

Com conteúdo:

```bash
EXPO_PUBLIC_API_URL=https://api.emilioeiji.com.br
```

Observações:
- `REACT_NATIVE_PACKAGER_HOSTNAME`: faz o celular encontrar o Metro/Expo na rede LAN.
- `EXPO_PUBLIC_API_URL`: define para qual API o app faz as requisições (`https://api.emilioeiji.com.br` em produção).

## Execução local

```bash
cd /workspace/mobile
npm install
npx expo start --host lan --clear
```

Se quiser web para validação rápida:

```bash
npm run web
```

## Fluxo mínimo implementado

- Login com JWT (`/api/token/`)
- Sessão persistida com `AsyncStorage` (`access` e `refresh`)
- Refresh de token (`/api/token/refresh/`)
- Logout
- Tratamento de `401` com tentativa de refresh
- Dashboard básico com teste de API em produção (`/api/employees/?page_size=1`)
- Tela de sessão/perfil básico
- Botões placeholder de módulos:
  - Funcionários
  - Uniformes
  - Atendimento médico
  - Calendário

## Arquivos principais

- `hooks/useAuth.ts`:
  - fluxo de autenticação e `authFetch`
- `lib/api.ts`:
  - cliente HTTP centralizado, `baseURL`, timeout e parser de erro
- `app/(tabs)/index.tsx`:
  - dashboard básico
- `app/(tabs)/settings.tsx`:
  - sessão e logout

## Limitações desta etapa

- Sem CRUD completo mobile dos módulos
- Sem grid de calendário mobile
- Sem push notifications
- Sem build APK/AAB
