# Simplifica - Gerenciador Financeiro

O Simplifica é uma aplicação web de gerenciamento financeiro pessoal que ajuda você a organizar suas finanças, controlar suas transações e alcançar suas metas de economia de forma simples e intuitiva.

## Visão Geral

Com o Simplifica, você pode:
- **Acompanhar suas Transações:** Registre todas as suas receitas e despesas em um só lugar.
- **Definir Metas de Economia:** Crie metas personalizadas, como "Viagem de Férias" ou "Carro Novo", e acompanhe seu progresso.
- **Organizar com Categorias:** Classifique suas transações em categorias para entender melhor seus hábitos de consumo.
- **Visualizar seu Desempenho:** Um dashboard amigável mostra um resumo da sua saúde financeira, incluindo saldo atual, economias do mês e o progresso das suas metas.

## Funcionalidades Principais

- **Dashboard:** Visão geral e instantânea das suas finanças.
  - Saldo total economizado.
  - Total de economias no mês atual.
  - Número de metas ativas.
  - Percentual de sucesso no alcance das metas.
  - Gráficos para visualizar a distribuição de despesas e o progresso ao longo do tempo.

- **Metas:**
  - Crie metas de economia com valor alvo e prazo (anual ou mensal).
  - Acompanhe o valor já economizado para cada meta.
  - Visualize o progresso através de barras percentuais.
  - As metas são movidas para o histórico quando são concluídas ou quando o prazo expirar.

- **Transações:**
  - Adicione novas receitas ou despesas.
  - Associe uma categoria para uma transação.
  - Filtre suas transações por tipo (receita/despesa) ou categoria.
  - Exclua transações existentes.

- **Categorias:**
  - Crie categorias personalizadas para receitas e despesas.
  - Atribua cores a cada categoria para fácil identificação.

## Tecnologias Utilizadas

### Backend
- **Java 17**
- **Spring Boot 3**
- **Spring Data JPA**
- **Maven**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript**

## Como Executar o Projeto

### Pré-requisitos
- JDK 17 ou superior
- Maven 3.8 ou superior

### Passos
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/grupo4-simplifica.git
   cd grupo4-simplifica
   ```

2. **Execute a aplicação backend:**
   - Você pode executar a aplicação através da sua IDE (Eclipse, IntelliJ) ou via linha de comando usando o Maven.
   ```bash
   ./mvnw spring-boot:run
   ```
   O servidor estará rodando em `http://localhost:8080`.

3. **Acesse o frontend:**
   - Abra seu navegador e acesse as páginas da aplicação:
     - **Dashboard:** `http://localhost:8080/dashboard.html`
     - **Metas:** `http://localhost:8080/metas.html`
     - **Transações:** `http://localhost:8080/transacoes.html`

## Estrutura do Projeto

```
.
├── src
│   ├── main
│   │   ├── java/com/simplifica/api
│   │   │   ├── controller/      # Controladores REST
│   │   │   ├── model/           # Entidades JPA
│   │   │   ├── repository/      # Repositórios Spring Data
│   │   │   └── ApiApplication.java # Classe principal
│   │   └── resources
│   │       ├── static/          # Arquivos frontend (HTML, CSS, JS)
│   │       └── application.properties # Configurações da aplicação
│   └── test/                    # Testes
├── .gitignore
├── build.gradle                 # Configuração do build
└── README.md
```
