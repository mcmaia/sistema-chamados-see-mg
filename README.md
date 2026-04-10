# Chamados - Sistema de Chamados EDU-MG

Sistema de gerenciamento de chamados com versoes mobile e desktop, construido com React.

## Pre-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (incluso com o Node.js)

## Instalacao

1. Clone o repositorio:

```bash
git clone <url-do-repositorio>
cd chamados
```

2. Instale as dependencias:

```bash
npm install
```

## Rodando o projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estara disponivel em `http://localhost:5173/`.

## Alternando entre versoes (Mobile / Desktop)

Por padrao, o projeto carrega uma das versoes. Para alternar, edite o arquivo `src/main.jsx` e troque o import:

- **Versao Mobile:**

```jsx
import App from '../chamados-mobile.jsx'
```

- **Versao Desktop:**

```jsx
import App from '../chamados-desktop.jsx'
```

Salve o arquivo e o navegador atualizara automaticamente.

## Build para producao

```bash
npm run build
```

Os arquivos otimizados serao gerados na pasta `dist/`.

## Estrutura do projeto

```
chamados/
├── chamados-mobile.jsx    # Componente principal (versao mobile)
├── chamados-desktop.jsx   # Componente principal (versao desktop)
├── src/
│   └── main.jsx           # Ponto de entrada da aplicacao
├── index.html             # HTML base
├── package.json           # Dependencias e scripts
└── vite.config.js         # Configuracao do Vite
```
