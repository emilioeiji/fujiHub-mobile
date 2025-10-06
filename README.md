# 📱 FujiHub Mobile

Este é o **aplicativo mobile do FujiHub**, desenvolvido com **React Native + Expo**, responsável por oferecer a experiência nativa em **iOS** e **Android**, consumindo a API do backend (Django REST Framework).

---

## 🚀 Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) para build e dev server
- [React Navigation](https://reactnavigation.org/) para navegação
- [Axios ou Fetch API](https://axios-http.com/) para comunicação com o backend
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) para armazenamento seguro de tokens

---

## ⚙️ Configuração do ambiente

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie o app

```bash
npx expo start
```

No terminal, você terá opções para abrir o app em:

- **Expo Go** (Android/iOS)
- **Android Emulator**
- **iOS Simulator**
- **Development Build**

---

## 📡 Integração com o Backend

- O backend roda em `http://127.0.0.1:8000`
- O mobile consome os endpoints da API, por exemplo:
  - `POST /api/token/` → login (JWT)
  - `GET /api/profile/` → dados do usuário autenticado

⚠️ Lembre-se: para testar no celular físico, use o **IP da sua máquina** na URL da API (ex: `http://192.168.0.10:8000`) em vez de `localhost`.

---

## 🗂️ Estrutura de pastas

```
mobile/
├── app/             # Rotas e telas (file-based routing do Expo Router)
├── assets/          # Ícones, imagens, fontes
├── components/      # Componentes reutilizáveis
├── services/        # Comunicação com API
├── styles/          # Estilos globais
├── App.js
└── README.md
```

---

## 🧪 Scripts úteis

- `npm run start` → inicia o servidor Expo
- `npm run android` → abre no emulador Android
- `npm run ios` → abre no simulador iOS
- `npm run web` → roda versão web (experimental)

---

## 🎯 Roadmap

- [ ] Integração completa com autenticação JWT
- [ ] Armazenamento seguro de tokens (SecureStore)
- [ ] Dashboard inicial conectado ao backend
- [ ] Tema visual unificado com branding FujiHub
- [ ] Deploy em lojas (Play Store / App Store)

---

## 📜 Licença

Este projeto é de uso interno do **FujiHub**.
