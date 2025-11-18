# 🔧 Configuração Detalhada do Firebase Console

## 📋 Acesso ao Console

1. **Abra o Firebase Console**: https://console.firebase.google.com
2. **Selecione seu projeto**: `codegenstudio-398fc`
3. **Menu lateral**: Clique em `Firestore Database`

---

## 🗂️ Coleções Necessárias

Você precisa criar **2 coleções principais**:

### 1. Coleção: `profiles`

#### 📝 Propósito:
Armazena as configurações e chaves de API de cada usuário.

#### 🔧 Estrutura dos Documentos:
```
profiles/
├── {userId}/  // ID do usuário do Firebase Auth
    ├── id: string (ex: "abc123xyz...")
    ├── updated_at: timestamp
    ├── gemini_api_key: string (opcional)
    ├── github_access_token: string (opcional)
    ├── supabase_project_url: string (opcional) - manter para compatibilidade
    ├── supabase_anon_key: string (opcional) - manter para compatibilidade
    ├── supabase_service_key: string (opcional) - manter para compatibilidade
    ├── stripe_public_key: string (opcional)
    ├── stripe_secret_key: string (opcional)
    ├── neon_connection_string: string (opcional)
    ├── openrouter_api_key: string (opcional)
    ├── gcp_project_id: string (opcional)
    ├── gcp_credentials: string (opcional) - JSON como string
    ├── firebase_project_id: string (opcional)
    └── firebase_service_account_key: string (opcional) - JSON como string
```

#### 📄 Exemplo de Documento:
```json
{
  "id": "abc123xyz789",
  "updated_at": "2025-01-16T18:30:00.000Z",
  "gemini_api_key": "AIzaSy...",
  "github_access_token": "ghp_...",
  "stripe_public_key": "pk_test_...",
  "openrouter_api_key": "sk-or-v1-..."
}
```

---

### 2. Coleção: `projects`

#### 📝 Propósito:
Armazena todos os projetos dos usuários com seus arquivos e histórico.

#### 🔧 Estrutura dos Documentos:
```
projects/
├── {projectId}/  // ID automático gerado pelo Firebase
    ├── id: string (ex: "fG7hK8mN9pQ2rS4")
    ├── user_id: string (ID do usuário dono do projeto)
    ├── name: string
    ├── files: array
    │   └── [
    │       {
    │           "name": string (ex: "index.html"),
    │           "language": string (ex: "html"),
    │           "content": string (código do arquivo)
    │       }
    │   ]
    ├── chat_history: array
    │   └── [
    │       {
    │           "role": "user" | "assistant" | "system",
    │           "content": string,
    │           "summary": string (opcional),
    │           "isThinking": boolean (opcional),
    │           "fromCache": boolean (opcional)
    │       }
    │   ]
    ├── env_vars: object
    │   └── {
    │       "VAR_NAME": "value",
    │       "API_KEY": "secret_key"
    │   }
    ├── created_at: timestamp
    └── updated_at: timestamp
```

#### 📄 Exemplo de Documento:
```json
{
  "id": "fG7hK8mN9pQ2rS4",
  "user_id": "abc123xyz789",
  "name": "Meu Projeto React",
  "files": [
    {
      "name": "App.tsx",
      "language": "typescript",
      "content": "import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;"
    },
    {
      "name": "styles.css",
      "language": "css",
      "content": "body { margin: 0; font-family: Arial; }"
    }
  ],
  "chat_history": [
    {
      "role": "user",
      "content": "Crie um componente React com Hello World"
    },
    {
      "role": "assistant",
      "content": "Claro! Aqui está um componente React simples...",
      "fromCache": false
    }
  ],
  "env_vars": {
    "REACT_APP_API_URL": "https://api.example.com",
    "NODE_ENV": "development"
  },
  "created_at": "2025-01-16T18:30:00.000Z",
  "updated_at": "2025-01-16T18:30:00.000Z"
}
```

---

## 🔧 Passo a Passo para Criar

### 1. Iniciar Firestore
1. No Firebase Console, vá em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar em modo de teste"** (por enquanto)
4. Selecione um local (ex: `southamerica-east1`)
5. Clique em **"Habilitar"**

### 2. Configurar Regras de Segurança
1. Em Firestore, clique na aba **"Regras"**
2. Substitua o conteúdo com as regras do arquivo `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: usuários só podem ler/escrever seu próprio profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects: usuários só podem acessar seus próprios projetos
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
```
3. Clique em **"Publicar"**

### 3. Criar Primeiros Documentos (Opcional)
Você pode criar documentos manualmente para teste:

#### Profile de Teste:
1. Clique em **"Iniciar coleção"**
2. Nome da coleção: `profiles`
3. ID do documento: `test-user-id`
4. Campos:
   ```
   id: "test-user-id"
   updated_at: "2025-01-16T18:30:00.000Z"
   gemini_api_key: "sua-chave-aqui"
   ```
5. Clique em **"Salvar"**

#### Projeto de Teste:
1. Clique em **"Iniciar coleção"**
2. Nome da coleção: `projects`
3. ID do documento: Deixe em branco (gerado automaticamente)
4. Campos:
   ```
   user_id: "test-user-id"
   name: "Projeto Teste"
   files: []
   chat_history: []
   env_vars: {}
   ```
5. Clique em **"Salvar"**

---

## 🔐 Configurar Autenticação

### 1. Ativar Email/Password
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Iniciar"**
3. Na aba **"Método de login"**, clique em **"Email/senha"**
4. Ative e clique em **"Salvar"**

### 2. Criar Usuários de Teste
1. Em **"Authentication"** → **"Usuários"**
2. Clique em **"Adicionar usuário"**
3. Email: `test@example.com`
4. Senha: `password123`
5. Clique em **"Adicionar usuário"**

---

## 🧪 Testar Configuração

### 1. Usar o Teste Local
1. Abra seu projeto: `http://localhost:3000/test-firebase.html`
2. Teste com as credenciais:
   - Email: `test@example.com`
   - Senha: `password123`
3. Execute todos os testes disponíveis

### 2. Verificar no Console
1. Em **Authentication** → **"Usuários"**: Veja se o login aparece
2. Em **Firestore Database** → **"Dados"**: Veja se os documentos aparecem

---

## 📊 Estrutura Final

```
codegenstudio-398fc/
├── Authentication (Usuários)
└── Firestore Database
    ├── profiles/ (Configurações dos usuários)
    │   ├── {userId}/
    │   └── {userId}/
    └── projects/ (Projetos dos usuários)
        ├── {projectId}/
        ├── {projectId}/
        └── {projectId}/
```

---

## ⚠️ Importante

- **Não crie as coleções manualmente** - o Firebase cria automaticamente
- **Sempre use as regras de segurança** para proteger os dados
- **Teste primeiro no modo de teste** antes de ir para produção
- **Monitore o uso** no console para evitar custos inesperados

---

## 🎯 Resumo Rápido

| Coleção | Finalidade | Chave Primária | Acesso |
|---------|-------------|----------------|----------|
| `profiles` | Configurações do usuário | `userId` (Firebase Auth UID) | Apenas dono |
| `projects` | Projetos e arquivos | `projectId` (auto-generated) | Apenas dono |

Pronto! Seu Firebase está configurado para funcionar com o CodeGen Studio! 🚀
