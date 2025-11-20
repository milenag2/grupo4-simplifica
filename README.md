# 💰 Simplifica - Gerenciador Financeiro Pessoal

**Simplifica** é uma aplicação web para controle financeiro, desenvolvida para ajudar usuários a organizarem suas receitas, despesas e metas de economia de forma visual e intuitiva.

O projeto utiliza uma arquitetura com **Spring Boot** no backend (API REST) e uma interface **Frontend** limpa e responsiva utilizando HTML5, CSS3 e JavaScript.

---

## 🚀 Funcionalidades

### 📊 Dashboard
- **Visão Geral:** Cards com Saldo Atual, Total de Receitas e Despesas do mês.
- **Gráficos:**
  - **Donut:** Distribuição de gastos do mês por categoria.
  - **Barras:** Histórico comparativo de Receitas vs. Despesas dos últimos 6 meses.

### 💸 Gestão de Transações
- Cadastro de Receitas e Despesas.
- Associação com categorias personalizadas.
- Filtros dinâmicos por Tipo e Categoria.
- Listagem com indicação visual de valores (Verde/Vermelho).
- Exclusão de transações.

### 🎯 Metas Financeiras
- Criação de metas de economia (Mensais ou Anuais).
- Associação opcional a uma categoria específica (ex: "Juntar dinheiro para um evento de Lazer").
- **Barra de Progresso:** Visualização em tempo real do quanto foi atingido da meta.
- **Adicionar Economia:** Funcionalidade para lançar valores poupados manualmente em uma meta.
- Separação automática entre Metas Ativas e Histórico (Concluídas/Vencidas).

### 🏷️ Categorias
- O sistema inicia com categorias padrão (Alimentação, Moradia, Transporte, Lazer, Salário).
- Possibilidade de criar novas categorias com cores personalizadas.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 21**
- **Spring Boot 3.4.11**
- **Spring Data JPA** (Hibernate)
- **MySQL Connector** (Banco de Dados)
- **Gradle** (Gerenciamento de Dependências e Build)

### Frontend
- **HTML5 & CSS3** (Layout responsivo e Modais personalizados)
- **JavaScript (ES6+)** (Lógica de consumo da API e manipulação do DOM)
- **Chart.js** (Renderização de gráficos)
- **FontAwesome** (Ícones)

---

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

1.  **Java JDK 21** (Necessário, conforme definido no `build.gradle`).
2.  **MySQL Server** (Recomenda-se o uso do **XAMPP** ou MySQL Workbench).
3.  **Git**.

---

## 🚀 Como Executar o Projeto

### 1. Configurar o Banco de Dados
O projeto espera um banco de dados MySQL rodando na porta `3306`.

1.  Abra o seu gerenciador MySQL (ex: phpMyAdmin no XAMPP).
2.  Crie um novo banco de dados vazio chamado:
    ```sql
    CREATE DATABASE simplifica_db;
    ```
    *(Não é necessário criar tabelas, o Hibernate fará isso automaticamente).*

3.  Verifique o arquivo `src/main/resources/application.properties`. A configuração padrão é:
    ```properties
    spring.datasource.username=root
    spring.datasource.password=
    ```
    *Se o seu MySQL tiver senha, altere este arquivo.*

### 2. Clonar e Rodar a Aplicação

Abra o terminal (ou PowerShell) e siga os passos:

```bash
# 1. Clone o repositório
git clone [https://github.com/milenag2/grupo4-simplifica.git](https://github.com/milenag2/grupo4-simplifica.git)

# 2. Entre na pasta do projeto
cd grupo4-simplifica

# 3. Execute a aplicação usando o Gradle Wrapper
# (No Windows):
.\gradlew bootRun

# (No Linux/Mac):
./gradlew bootRun

### 3. Acessar o Sistema
Abra o seu navegador e acesse:

👉 **http://localhost:8080**

---

## 📂 Estrutura do Projeto
grupo4-simplifica/
├── src/main/java/com/simplifica/api/
│   ├── controllers       # Controladores REST (Endpoints)
│   ├── models            # Entidades do Banco de Dados (Transacao, Meta, Categoria)
│   ├── repositories      # Interfaces de acesso ao BD (JPA)
│   ├── CorsConfig.java   # Configuração de segurança CORS
│   └── DataSeeder.java   # Popula o banco com categorias iniciais
│
├── src/main/resources/
│   ├── application.properties # Configuração do Banco de Dados
│   └── static/           # Arquivos do Frontend
│       ├── *.html        # Páginas (Dashboard, Transações, Metas)
│       ├── *.css         # Estilos
│       ├── *.js          # Lógica do Frontend
│       └── favicon.ico   # Ícone do site
│
└── build.gradle          # Dependências do Projeto

---

## 📡 Documentação da API (Endpoints Principais)

A aplicação expõe uma API RESTful na porta 8080:

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | `/dashboard/resumo-principal` | Retorna saldo, totais do mês e dados para gráficos. |
| **GET** | `/transacoes` | Lista todas as transações. |
| **POST** | `/transacoes` | Cria uma nova receita ou despesa. |
| **GET** | `/metas` | Lista todas as metas financeiras. |
| **POST** | `/metas` | Cria uma nova meta. |
| **POST** | `/economias` | Adiciona um valor economizado a uma meta. |
| **GET** | `/categorias` | Lista todas as categorias disponíveis. |

---

**Desenvolvido com 💙 pelo Grupo 4**