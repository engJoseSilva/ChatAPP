# Fullstack Chat App (WebSocket + React Native + TypeScript + PostgreSQL)

## 📦 Backend

### Requisitos
- Node.js
- PostgreSQL (opcional, se integrares depois)
- TypeScript

### Passos para executar localmente

```bash
cd server
npm install
npx ts-node-dev src/chatServer.ts
```

> O servidor WebSocket será iniciado em `ws://localhost:4000`

---

## 📱 Frontend (React Native com Expo)

### Requisitos
- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode para emuladores

### Passos para executar

```bash
cd app
npm install

# Para Android:
npx expo start --android

# Para iOS:
npx expo start --ios
```

> A app mobile irá conectar-se ao WebSocket e exibir a interface estilo iMessage

---

## ✅ Funcionalidades principais

- WebSocket com reconexão e sincronização de mensagens perdidas
- Evita mensagens duplicadas
- Interface responsiva tipo iMessage
- Armazena mensagens em memória (ou PostgreSQL se aplicável)
- Ordem garantida das mensagens