# Correção do Erro de Login: "auth/operation-not-allowed"

Este erro ocorre porque os métodos de login que sua aplicação tenta usar (Email/Senha e Google) não estão ativados no seu projeto Firebase.

Siga os passos abaixo para habilitá-los no Console do Firebase:

## Passo a Passo para Habilitar os Provedores de Autenticação

1.  **Acesse o Console do Firebase:**
    *   Abra seu navegador e vá para o [Console do Firebase](https://console.firebase.google.com/).
    *   Faça login com a sua conta do Google.

2.  **Selecione o seu Projeto:**
    *   Na lista de projetos, encontre e clique no projeto com o ID `ancient-bond-470823-q0`.

3.  **Vá para a Seção de Autenticação:**
    *   No menu lateral esquerdo, clique em **Build** e depois em **Authentication**.

4.  **Acesse a Aba "Sign-in method":**
    *   Dentro da seção de Autenticação, clique na aba **Sign-in method**.

5.  **Habilite o Provedor "Email/Password":**
    *   Na lista de "Provedores de login", clique em **Email/senha**.
    *   Ative a opção (movendo o interruptor para a direita).
    *   Clique em **Salvar**.

6.  **Habilite o Provedor "Google":**
    *   Volte para a lista de "Provedores de login".
    *   Clique em **Google**.
    *   Ative a opção (movendo o interruptor para a direita).
    *   Selecione um **E-mail de suporte do projeto** (geralmente o seu próprio e-mail).
    *   Clique em **Salvar**.

Após seguir estes passos, a autenticação por Email/Senha e Google deverá funcionar na sua aplicação. Não é necessário alterar o código.
