# 🏠 Casa Certa Imobiliária
### Projeto UC14 — Laura

> Plataforma digital para divulgação e busca de imóveis, com navegação simples, filtros inteligentes e área do cliente completa.

---

## 📋 Descrição do Projeto

O **Casa Certa Imobiliária** é um site desenvolvido como projeto de conclusão do curso (UC14), aplicando conceitos de arquitetura e experiência do usuário no Front-End.

A plataforma permite que usuários busquem imóveis para compra ou aluguel, simulem financiamentos, entrem em contato com corretores e gerenciem seus dados através de uma área do cliente personalizada.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Visual Studio Code](https://code.visualstudio.com/)
- Extensão **Live Server** (Ritwick Dey) instalada no VS Code

### Passo a passo

1. Baixe ou clone a pasta do projeto
2. Abra a pasta `CasaCerta` no VS Code
3. Clique com o botão direito no arquivo `index.html`
4. Selecione **"Open with Live Server"**
5. O site abrirá automaticamente no navegador em `http://localhost:5500`


O que você precisa fazer
Adiciona uma linha no server.js, logo após o app.use(cors()):
jsconst path = require('path');
app.use(express.static(path.join(__dirname, '..')));
Reinicia o Node, para o Live Server, e acessa ${API}.
Para seus colegas acessarem, você descobre seu IP rodando no PowerShell:
bashipconfig
E passa o endereço IPv4 para eles, tipo http://192.168.18.49:3000.



> ⚠️ **Importante:** Não abra os arquivos diretamente pelo Windows (duplo clique). Use sempre o Live Server para evitar erros de carregamento.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
|-----------|-----------|
| **HTML5** | Estrutura e semântica das páginas |
| **CSS3** | Estilização, responsividade e animações |
| **JavaScript (ES6+)** | Interatividade, filtros e lógica do sistema |
| **LocalStorage** | Armazenamento de dados do usuário no navegador |
| **Google Maps Embed** | Visualização de localização dos imóveis |
| **Google Fonts** | Tipografia (Playfair Display + Lato) |
| **Pexels** | Banco de imagens gratuitas |

---

## 📁 ESTRUTURA DE ARQUIVOS


```
CasaCerta/
│
├── index.html              # Página inicial (Home)
├── sobre.html              # Sobre a imobiliária
├── imoveis.html            # Listagem de imóveis
├── detalhes.html           # Detalhes de um imóvel
├── anunciar.html           # Anunciar imóvel
├── contato.html            # Canais de atendimento
├── financiamento.html      # Simulador de financiamento
├── login.html              # Login da área do cliente
├── cadastro.html           # Cadastro de novo usuário
├── recuperar.html          # Recuperação de senha
├── perfil.html             # Perfil e dashboard do cliente
├── README.md               # Documentação do projeto
│
├── css/
│   ├── style.css           # Estilos globais e design system
│   └── home.css            # Estilos específicos da página inicial
│
├── js/
│   ├── dados.js            # Dados mockados dos imóveis
│   ├── main.js             # Funções globais (favoritos, cards, simulação)
│   └── componentes.js      # Navbar e footer reutilizáveis
│
└── img/
    ├── pexels-cmoon-12558933.jpg
    ├── pexels-jonathanborba-10115004.jpg
    ├── pexels-sergio-monsalve-(...).jpg
    └── ...                 # Demais fotos dos imóveis
```

---

## 📄 Explicação de Cada Página

### 🏠 Home — `index.html`
Página principal do site. Contém:
- **Hero** com foto de destaque e chamada para ação
- **Busca rápida** com abas (Comprar, Anunciar, Aluguel, Planta) e filtros por tipo, cidade e bairro
- **Cards de features** explicando as funcionalidades (Financiamento, Corretor, Mapa)
- **Imóveis em destaque** selecionados automaticamente
- **Seção de números** com credenciais da imobiliária
- **CTA** chamando para anunciar imóvel

---

### 🏢 Sobre Nós — `sobre.html`
Apresentação institucional da Casa Certa. Contém:
- Propósito, Missão e Visão da imobiliária
- Texto sobre atendimento personalizado
- Seção de valores (Confiança, Segurança, Inovação, Excelência)
- Cards da equipe de corretores com foto, nome e CRECI

---

### 🔍 Imóveis — `imoveis.html`
Listagem completa de imóveis disponíveis. Contém:
- **6 filtros simultâneos:** Finalidade, Tipo, Cidade, Bairro, Quartos e Preço máximo
- Ordenação por padrão, menor preço, maior preço e maior área
- Contador de resultados encontrados
- Cards com foto, nome, localização, preço e especificações
- Botão de favoritar em cada card
- Redirecionamento para página de detalhes

---

### 🏡 Detalhes do Imóvel — `detalhes.html`
Página completa de um imóvel específico. Contém:
- Galeria de fotos com thumbnails clicáveis
- Especificações completas (área, quartos, banheiros, vagas, extras)
- Descrição detalhada do imóvel
- Mapa de localização via Google Maps
- Atalhos para simular financiamento, agendar visita e WhatsApp
- Seção de imóveis semelhantes

---

### 📢 Anunciar — `anunciar.html`
Página para proprietários cadastrarem seus imóveis. Contém:
- Seção de vantagens de anunciar (fotos profissionais, divulgação online, atendimento especializado)
- Formulário completo: nome, e-mail, telefone, cidade, tipo, endereço, valor, finalidade, descrição e foto
- Validação dos campos obrigatórios
- Mensagem de sucesso após envio

---

### 📞 Contato — `contato.html`
Canais de atendimento da imobiliária. Contém:
- Botões de WhatsApp por setor (Corretor, Financeiro, Condomínios, Manutenção)
- Endereço completo: Av. 7 de Setembro, 651 - Centro, Getúlio Vargas/RS
- Telefone e e-mail de suporte
- Mapa interativo do Google Maps com localização da sede
- Link para abrir no Google Maps

---

### 📊 Simulação de Financiamento — `financiamento.html`
Calculadora de financiamento imobiliário. Contém:
- Campos: Valor do imóvel, Entrada, Prazo (10 a 35 anos) e Taxa de juros anual
- Cálculo pelo **Sistema Price** (tabela de amortização)
- Resultado completo: valor financiado, parcela estimada, total a pagar e total de juros
- Botão para salvar simulação no perfil do usuário (requer login)
- Botão para contato com especialista

---

### 🔐 Login — `login.html`
Acesso à área do cliente. Contém:
- Campos de e-mail/telefone e senha
- Validação de credenciais via LocalStorage
- Redirecionamento automático para o perfil após login
- Links para recuperação de senha e cadastro

---

### 📝 Cadastro — `cadastro.html`
Criação de nova conta. Contém:
- Campos: nome, telefone, e-mail, CPF/CNPJ, senha e confirmação de senha
- Validação de todos os campos
- Verificação de e-mail já cadastrado
- Aceitação dos termos de uso

---

### 🔑 Recuperar Senha — `recuperar.html`
Recuperação de acesso à conta. Contém:
- Campo para informar e-mail ou telefone
- Simulação de envio de instruções
- Informações de suporte (telefone, e-mail, endereço)
- Link direto para WhatsApp de suporte

---

### 👤 Perfil do Cliente — `perfil.html`
Dashboard completo do usuário logado. Contém:
- **Aba Meus Dados:** editar nome, telefone, e-mail, CPF e senha
- **Aba Favoritos:** imóveis salvos com o coração
- **Aba Financiamentos:** simulações salvas com parcela e detalhes
- **Botão Sair:** encerra a sessão com confirmação
- Proteção de rota — redireciona para login se não estiver autenticado
- Navbar exibe o nome do usuário quando logado

---

## ⚙️ Funcionalidades Implementadas

### Sistema de Usuários
- ✅ Cadastro com validação completa
- ✅ Login com autenticação por e-mail ou telefone
- ✅ Sessão persistida via LocalStorage
- ✅ Edição de dados pessoais
- ✅ Logout com confirmação
- ✅ Proteção de páginas restritas

### Imóveis
- ✅ 6 imóveis mockados com dados completos
- ✅ Filtros combinados (finalidade, tipo, cidade, bairro, quartos, preço)
- ✅ Ordenação por preço e área
- ✅ Sistema de favoritos persistente
- ✅ Galeria de fotos com troca de imagem
- ✅ Mapa de localização por imóvel

### Simulação de Financiamento
- ✅ Cálculo pelo Sistema Price
- ✅ Resultado detalhado (parcela, total, juros)
- ✅ Salvar simulação no perfil
- ✅ Histórico de simulações por usuário

### Interface
- ✅ Design responsivo (mobile, tablet e desktop)
- ✅ Navbar com link ativo destacado
- ✅ Navbar exibe nome do usuário logado
- ✅ Botão flutuante do WhatsApp em todas as páginas
- ✅ Footer com links e informações de contato
- ✅ Animações de entrada nas seções

---

## 👩‍💻 Autora

**Laura**
Projeto desenvolvido para UC14 — Desenvolvimento Front-End