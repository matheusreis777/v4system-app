# 📱 V4 System - Documentação de Portfólio

## 🎯 Visão Geral

**V4 System** é um aplicativo mobile nativo desenvolvido em **React Native com Expo Router**, projetado para gerenciar operações de vendas e movimentação de veículos. O sistema oferece funcionalidades robustas de CRM, gestão de estoque e acompanhamento de leads com autenticação segura e notificações em tempo real.

**Versão:** 1.0.0  
**Plataformas:** iOS (iPad compatible) | Android  
**Framework:** Expo 54.x, React 19, React Native 0.81.5  
**Linguagem:** TypeScript 5.9.2

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────┐
│           CAMADA DE APRESENTAÇÃO               │
│  React Native + Expo Router (6.x) + TypeScript │
│         (iOS, Android, Web)                     │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│         CAMADA DE COMPONENTES UI/UX            │
│  • Componentes reutilizáveis (Button, Input)   │
│  • Sistema de temas (Dark/Light)               │
│  • Ícones (Feather Icons)                      │
│  • Gradientes (expo-linear-gradient)           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│      CAMADA DE LÓGICA / CONTEXTS              │
│  • AuthContext (Autenticação)                  │
│  • LoadingContext (Estados de carregamento)    │
│  • LookupContext (Dados dinâmicos)             │
│  • ThemeContext (Temas)                        │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│       CAMADA DE SERVIÇOS / API                │
│  • Axios (HTTP Client)                         │
│  • Services (Consultoria genérica)             │
│  • Armazenamento seguro (expo-secure-store)    │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│        CAMADA DE PERSISTÊNCIA                 │
│  • AsyncStorage (Dados locais)                 │
│  • Secure Store (Tokens + Senhas)              │
│  • Cache em memória (Lookup tables)            │
└─────────────────────────────────────────────────┘
```

---

## 📑 Funcionalidades Principais

### 1️⃣ **Autenticação e Segurança**

#### 🔐 Sistema de Login

- **Autenticação por CPF + Senha**
- Validação de telefone como etapa de segurança
- Tokens JWT armazenados em `expo-secure-store`
- Recuperação de senha com validação de telefone

**endpoints relacionados:**

- `POST /login` - Login com CPF e Senha
- `POST /login/ValidarTelefoneLogin/{telefone}/{cpf}` - Validar acesso
- `POST /login/TrocarSenha` - Alterar senha

**Fluxo:**

```
Login Screen → AuthGate → AuthContext → Secure Storage → App Protegido
```

#### 👤 Gerenciamento de Perfil

- Exibição de dados do usuário (Nome, CPF, Telefone)
- Mascaramento seguro de dados sensíveis
- Logout com limpeza de sessão

---

### 2️⃣ **Painel do Vendedor (Dashboard)**

#### 📊 Visualização de Movimentações

- **Listagem paginada** de movimentações de vendas
- Filtros avançados:
  - Por Status de Movimentação
  - Por Momento (etapa do processo)
  - Por Tipo de Negociação
  - Por Vendedor
  - Por Placa do Veículo
  - Por Cliente (nome)
  - Por Telefone

#### 💾 Funcionalidades:

- **Paginação inteligente** com cache em memória (max 10 itens/página)
- **Pull-to-refresh** para atualizar dados
- **Carregamento sob demanda** (Infinite scroll)
- **Status visual** com cores por momento e tipo de negociação
- **Cancelamento de movimentações** com justificativa obrigatória

#### 📱 Card de Movimentação exibe:

- Nome do cliente + Telefone (formatado)
- Placa do veículo
- Status da movimentação
- Momento (etapa) da negociação
- Tipo de negociação
- Nome do vendedor
- Última observação
- Data de inclusão

**API:**

```
POST /PainelDoVendedor
Filtro: {
  EmpresaId: number
  StatusMovimentacaoId: number
  MomentoId: number
  TipoNegociacaoId: number
  VendedorId: number (opcional)
  Placa: string (opcional)
  Nome: string (opcional)
  Telefone: string (opcional)
  Pagina: number (padrão: 1)
  TamanhoDaPagina: number (padrão: 10)
}
```

---

### 3️⃣ **Gestão de Clientes**

#### 👥 Busca e Listagem

- Busca avançada com múltiplos critérios
- Filtros por:
  - Nome do cliente
  - Email
  - CPF/CNPJ
  - Telefone
- Paginação com 10 itens por página
- Histórico de clientes com cache

#### 📋 Dados do Cliente:

- ID
- Nome completo
- Email
- CPF/CNPJ (mascarado)
- Telefone (formatado)

**API:**

```
GET /pessoa
Filtros: {
  EmpresaId, Nome, Email, CpfCnpj, Telefone, Pagina, TamanhoDaPagina
}
```

---

### 4️⃣ **Gestão de Estoque de Veículos**

#### 🚗 Catálogo de Veículos

- Lista completa de veículos em estoque
- Filtros especializados:
  - Por Placa (formatada)
  - Por Tipo de Veículo
  - Por Marca
  - Por Modelo
  - Por Status do Veículo
- Paginação inteligente com cache

#### 🎨 Informações do Veículo:

- **Identificação:** ID, Placa, Status
- **Especificação:** Tipo, Marca, Modelo
- **Fabricação:** Ano do modelo, Ano de fabricação
- **Características:** Cor, Combustível, KM
- **Comercial:** Valor de venda (quando preenchido)

#### 📊 Statusl de Veículo

- Veículos ativos no estoque
- Veículos vendidos
- Veículos em manutenção

**API:**

```
GET /Estoque
Filtros: {
  EmpresaId, Placa, TipoVeiculoId, MarcaId, ModeloId, StatusVeiculoId
}
Retorna: {
  id, placa, statusVeiculoNome, tipoVeiculoDescricao,
  modelo, anoModelo, anoFabricacao, quilometragem, corNome,
  combustivelNome, resumoGeral.valorVenda
}
```

---

### 5️⃣ **Sistema de Notificações**

#### 🔔 Notificações em Tempo Real

- Push Notifications com `expo-notifications`
- Notificações locais e remotas
- Status de leitura de notificações

#### ✉️ Funcionalidades:

- **Listar notificações** por usuário e empresa
- **Marcar como lida** com navegação automática
- **Visualização de timestamp** formatado em português
- **Diferenciação visual** entre lidas e não lidas
- **Clique na notificação** leva aos detalhes da movimentação

**API:**

```
GET /notificao/{usuarioId}/{empresaId}
  - Retorna lista de NotificacaoDto
  - Campos: id, titulo, mensagem, dataCriacao, lida, referencia

PATCH /notificacao/{id}/marcar-como-lida
  - Marca notificação como lida
```

**Service de Push:**

- Configuração automática de tokens
- Gerenciamento de permissões
- Handling de notificações em foreground/background

---

### 6️⃣ **Novo Lead / Prospecção**

#### 📞 Captura de Leads

- Formulário estruturado para novos contatos
- Campos obrigatórios:
  - **Nome** do prospect
  - **Telefone** (validação de formato)
  - **CPF/CNPJ** (opcional)
  - **Observação** (descrição do lead)

#### ✅ Validações:

- Campo obrigatório de nome
- Telefone com mínimo de 10 dígitos
- Formatação automática de telefone
- Feedback visual de erro

#### 💾 Persitência:

- Salva novos leads via API
- Feedback com toast de sucesso/erro
- Limpeza de form após sucesso

**API:**

```
POST /NovoLead
Body: {
  Nome: string (obrigatório)
  Telefone: number (obrigatório, min 10 dígitos)
  CpfCnpj: string (opcional)
  Observacao: string (obrigatório)
  EmpresaId: number
}
```

---

### 7️⃣ **Checklist Dinâmico de Avaliação**

#### ✔️ Questionário Dinâmico

- Carregamento de perguntas por tipo de veículo
- Armazenamento de respostas estruturadas
- Visualização de histórico de avaliações

#### 📝 Funcionalidades:

- Exibição de perguntas associadas ao código do veículo
- Respostas anteriores com timestamps
- Integração com dados de avaliação
- Navegação com volume buttons (back)

**APIs Relacionadas:**

```
GET /Avaliacao/{veiculoId}/{empresaId}
  - Retorna avaliações e respostas do questionário

GET /Questionario/Dinamico/{codigo}/{empresaId}
  - Retorna questionário dinâmico por tipo de veículo
```

---

### 8️⃣ **Tela de Introdução / Seleção de Empresa**

#### 🏢 Multi-Empresa

- Usuários podem ter acesso a múltiplas empresas
- Interface elegante de seleção
- Ícones visuais para representar empresas
- Armazenamento da empresa selecionada

#### 🎯 Fluxo:

```
Login → Intro (selecionar empresa) → Painel do Vendedor
```

---

## 🧩 Componentes Principais

### Componentes Reutilizáveis

| Componente             | Propósito                    | Props Principais                          |
| ---------------------- | ---------------------------- | ----------------------------------------- |
| **Button**             | Botão customizado            | title, onPress, loading, disabled         |
| **Input**              | Campo de entrada             | placeholder, value, onChange, error, mask |
| **Header**             | Cabeçalho de tela            | title, leftIcon, rightIcons               |
| **BottomTab**          | Navegação inferior           | tabs com ícones e labels                  |
| **FilterDropdown**     | Dropdown para filtros        | items, selectedId, onSelect               |
| **Tag**                | Labels de status             | color, text                               |
| **LoadingOverlay**     | Sobreposição de carregamento | visible, message                          |
| **GradientBackground** | Fundo com gradiente          | colors, gradient direction                |
| **SwitchTheme**        | Toggle de tema               | onToggle                                  |

### Sistema de Temas

```typescript
Theme Interface:
├── colors:
│   ├── primary    // Azul principal (#2563EB)
│   ├── secondary  // Vermelho (#DC2626)
│   ├── background // Background dinâmico
│   ├── text       // Texto primário
│   └── border     // Bordas
├── fonts:
│   ├── sizes: { xs, sm, md, lg, xl, xxl }
│   ├── weights: { regular, medium, bold, extrabold }
│   └── families: { roboto, sans }
└── spacing:
    └── { 4, 8, 12, 16, 24, 32 }
```

---

## 🔄 Contextos (Estado Global)

### **AuthContext**

Gerencia estado de autenticação do usuário.

```typescript
interface AuthContextData {
  userToken: string | null; // JWT token
  isAuthenticated: boolean; // Estado autenticado
  loading: boolean; // Carregando dados
  signIn(cpf, senha): LoginResponse;
  validatePhone(telefone, cpf): boolean;
  trocaSenha(cpf, senha): number;
  signOut(): void;
}
```

### **LookupContext**

Armazena dados de lookups (tabelas de referência) dinâmicos.

```typescript
interface LookupContextData {
  status: LookupItem[]; // Status de movimentações
  momentos: LookupItem[]; // Momentos/etapas de negócios
  tiposNegociacao: LookupItem[]; // Tipos de negociação
  vendedores: LookupItem[]; // Lista de vendedores
  loading: boolean;
}
```

### **LoadingContext**

Gerencia estados de carregamento global.

```typescript
interface LoadingContextData {
  isLoading: boolean;
  setLoading(value: boolean): void;
}
```

### **ThemeContext**

Alterna entre temas claro/escuro.

```typescript
interface ThemeContextData {
  isDark: boolean;
  toggleTheme(): void;
  currentTheme: Theme;
}
```

---

## 🛠️ Serviços de API

### Estrutura de Serviço Genérico

```typescript
class GenericService<T> {
  protected get(
    url: string,
    id?: number,
    params?: Object,
  ): Promise<AxiosResponse<T>>;

  protected post(url: string, data: any): Promise<AxiosResponse<T>>;

  protected put(url: string, id: number, data: any): Promise<AxiosResponse<T>>;

  protected delete(url: string, id: number): Promise<AxiosResponse<void>>;
}
```

### Serviços Especializados

| Serviço                     | Responsabilidade          | Métodos Principais                       |
| --------------------------- | ------------------------- | ---------------------------------------- |
| **authService**             | Login e autenticação      | login(), validaTelefone(), trocarSenha() |
| **painelDoVendedorService** | Dashboard de vendas       | consultar(filtro)                        |
| **clienteService**          | Gestão de clientes        | consultar(filtro)                        |
| **estoqueService**          | Catálogo de veículos      | consultar(filtro)                        |
| **notificacaoService**      | Notificações              | obter(), marcarComoLida()                |
| **movimentacaoService**     | Controle de movimentações | cancelar(), obter()                      |
| **checklistService**        | Checklists dinâmicos      | obter(), criar()                         |
| **avaliacaoService**        | Avaliações de veículos    | obterAvaliacaoPorVeiculo()               |
| **questionarioService**     | Questionários             | listaQuestionarioDinamico()              |
| **novoLeadService**         | Cadastro de leads         | criar()                                  |
| **notificacaoService**      | Push notifications        | registrarToken(), enviar()               |

---

## 📱 Rotas e Navegação

### Estrutura de Rotas (Expo Router)

```
/
├── auth/
│   ├── login/          ← Tela de login
│   └── forgot/         ← Recuperação de senha
├── app/
│   ├── (tabs)/
│   │   ├── painel      ← Dashboard de vendas
│   │   ├── cliente     ← Gestão de clientes
│   │   ├── estoque     ← Catálogo de veículos
│   │   ├── novoLead    ← Captura de leads
│   │   ├── notificacao ← Central de notificações
│   │   └── perfil      ← Perfil do usuário
│   ├── intro           ← Seleção de empresa
│   ├── detalhesMovimentacao/[id]     ← Detalhes da movimentação
│   ├── checklist-dinamico/           ← Questionário
│   ├── dadosVeiculo/                 ← Dados do veículo
│   └── detalhesMovimentacao/         ← Detalhes movimentação
```

### Fluxo de Navegação Principal

```
App Launch
  ↓
AuthGate Check
  ├─ Não autenticado → /auth/login
  └─ Autenticado → /app/intro
                    ├─ Selecionar Empresa
                    └─ /app/painel (Dashboard)
                        ├─ Tab Navigation
                        │  ├─ painel
                        │  ├─ cliente
                        │  ├─ estoque
                        │  ├─ novoLead
                        │  ├─ notificacao
                        │  └─ perfil
                        └─ Deep Links
                           ├─ /app/detalhesMovimentacao/{id}
                           ├─ /app/checklist-dinamico
                           └─ /app/dadosVeiculo
```

---

## 💾 Modelos de Dados

### Principais Interfaces TypeScript

```typescript
// Movimentação de Vendas
interface PainelDoVendedor {
  movimentacaoId: number;
  momentoId: number;
  tipoNegociacaoId: number;
  clienteId: number;
  clienteNome: string;
  telefone: number;
  ultimaObservacaoNaMovimentacao: string;
  statusMovimentacaoId: number;
  justificativaCancelamento?: string;
  vendedorId?: number;
  vendedorNome?: string;
  veiculoVinculado: boolean;
  dataAgendamento?: string;
  dataInclusao: string;
  tipoQualificacaoId: number;
}

// Cliente
interface ClienteFiltro {
  id: number;
  EmpresaId: number;
  Nome: string;
  Email: string;
  CpfCnpj: string;
  Telefone: string;
  Pagina: number;
  TamanhoDaPagina: number;
  OrdenarPor: string;
  Ordem: "ASC" | "DESC";
}

// Veículo em Estoque
interface EstoqueRetorno {
  id: number;
  placa: string;
  statusVeiculoNome: string;
  tipoVeiculoDescricao: string;
  modelo: { marca: { nome: string }; nome: string };
  anoModelo: number;
  anoFabricacao: number;
  quilometragem: number;
  corNome: string;
  combustivelNome: string;
  resumoGeral?: { valorVenda: number };
}

// Notificação
interface NotificacaoDto {
  id: number;
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  referencia?: string;
  usuarioId: number;
  empresaId: number;
}

// Login
interface LoginResponse {
  token: string;
  usuarioNome: string;
  usuarioPerfilDescricao: string;
  usuarioLogin: string;
  usuarioId: number;
  empresas: Empresa[];
  telefone: number;
}

// Empresa
interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  ativa: boolean;
}
```

---

## 🎨 Estilização e Design System

### Sistema de Cores

**Temas suportados:**

- **Light Mode** (Padrão)
  - Fundo: #FFFFFF
  - Primário: #2563EB (Azul)
  - Secundário: #DC2626 (Vermelho)
  - Texto: #1F2937 (Cinza escuro)

- **Dark Mode**
  - Fundo: #1F2937
  - Primário: #3B82F6 (Azul mais claro)
  - Secundário: #EF4444 (Vermelho mais claro)
  - Texto: #F3F4F6 (Cinza muito claro)

### Tipografia

- **Font Family:** Roboto (exportada com `expo-font`)
- **Tamanhos:** xs (10px), sm (12px), md (14px), lg (16px), xl (18px), xxl (24px)
- **Pesos:** 400 (Regular), 500 (Medium), 700 (Bold), 800 (Extra Bold)

### Espaçamento

- **Scale:** 4px, 8px, 12px, 16px, 24px, 32px

---

## 🔐 Segurança e Persistência

### Armazenamento de Dados

| Tipo         | Ferramenta        | Dados                              | Segurança                                  |
| ------------ | ----------------- | ---------------------------------- | ------------------------------------------ |
| **Sensível** | expo-secure-store | Token JWT, Senhas                  | Encrypted (iOS Keychain, Android Keystore) |
| **Local**    | AsyncStorage      | Empresa ID, Nome, Login            | Não-encriptado (apenas dados públicos)     |
| **Memória**  | Context + Refs    | Cache de lookups, Cache de queries | Volatile (perdido ao fechar app)           |

### Fluxo de Autenticação

```
1. Usuário digita CPF + Senha
   ↓
2. Validação de telefone (2FA)
   ↓
3. API retorna JWT Token + Dados do Usuário
   ↓
4. Token armazenado em expo-secure-store
   ↓
5. Dados de sessão em AsyncStorage
   ↓
6. AuthContext marca como isAuthenticated = true
   ↓
7. Usuário pode acessar app protegido
   ↓
8. Token incluído automaticamente em headers de requisições (via interceptor?)
```

---

## 📊 Utilitários e Helpers

### Máscaras de Formatação

```typescript
// utils/masks.ts
maskPhone(value: string): string
  // (11) 99999-9999 ou (11) 9999-9999

maskCPF(value: string): string
  // 999.999.999-99

maskPlate(value: string): string
  // ABC1234 → ABC-1234

maskData(date: string): string
  // Formata para DD/MM/YYYY
```

### Enums e Helpers

```typescript
// utils/enums/enumLabels.ts
obterLabelStatus(statusId: number): string
obterLabelMomento(momentoId: number): string
obterLabelTipoNegociacao(tipoId: number): string

// utils/tagColors.ts
obterCorMomento(momentoId: number): string
obterCorNegociacao(tipoId: number): string
obterCorVendedor(vendedorId: number): string
```

---

## 📦 Dependências Principais

```json
{
  "critical": [
    "react@19.1.0",
    "react-native@0.81.5",
    "expo@~54.0.32",
    "expo-router@~6.0.22",
    "axios@^1.6.8"
  ],
  "ui": [
    "@expo/vector-icons@^15.0.3",
    "expo-linear-gradient@~15.0.8",
    "react-native-gesture-handler@~2.28.0"
  ],
  "storage": [
    "@react-native-async-storage/async-storage@2.2.0",
    "expo-secure-store@*"
  ],
  "notifications": ["expo-notifications@~0.32.16", "expo-device@~8.0.10"],
  "utils": [
    "react-native-keyboard-aware-scroll-view@^0.9.5",
    "expo-font@~14.0.11",
    "@react-native-picker/picker@2.11.1",
    "react-native-toast-message@^2.3.3"
  ]
}
```

---

## 🚀 Performance e Otimizações

### Estratégias Implementadas

1. **Paginação Inteligente**
   - Carregamento sob demanda (Infinite scroll)
   - Limit de 10 itens por página
   - Cache em memória para evitar re-fetches

2. **Memoização**
   - `useCallback` em renderItems
   - Contextos para evitar prop-drilling
   - Refs para garantir lista de requisições

3. **Lazy Loading**
   - Fonts carregadas sob demanda com `expo-font`
   - Imagens otimizadas para resolução de tela
   - Stack screens com animações fade

4. **Estado Otimizado**
   - Lock de requisições (`requestLock`) para evitar duplicatas
   - Cache local para filtros frequentes
   - Cleanup de listeners em useEffect

---

## 🧪 Padrões de Desenvolvimento

### Estrutura de Tela

```typescript
export default function MinhaTelaComponent() {
  // 1️⃣ State
  const [dados, setDados] = useState<Tipo[]>([])

  // 2️⃣ Contexts e Hooks
  const { contexto } = useContext(MeuContext)

  // 3️⃣ Efeitos
  useEffect(() => {
    carregarDados()
  }, [])

  // 4️⃣ Handlers
  async function carregarDados() { }
  function handleFiltar() { }

  // 5️⃣ Render
  return (
    <>
      <Header title="Minha Tela" />
      <KeyboardAwareScrollView>
        {/* Conteúdo */}
      </KeyboardAwareScrollView>
      <BottomTab />
    </>
  )
}
```

### Padrão de Serviço

```typescript
class MinhaService extends GenericService<TipoDado> {
  private readonly url = "/endpoint";

  consultar(filtro: FiltroTipo) {
    return this.get(this.url, undefined, filtro);
  }

  criar(dados: TipoDado) {
    return this.post(this.url, dados);
  }
}

export const minhaService = new MinhaService();
```

### Tratamento de Erros (Toast)

```typescript
import ToastService from "../../components/alerts/ToastService";

try {
  await minhaService.consultar(filtro);
} catch (error) {
  ToastService.error("Título", "Mensagem de erro");
}
```

---

## 📈 Métricas e KPIs do Sistema

### Funcionalidades Cobertas

| Módulo              | Cobertura                          |
| ------------------- | ---------------------------------- |
| Autenticação        | 100% (Login, 2FA, Logout)          |
| Dashboard           | 100% (Listagem, Filtros, Ações)    |
| Gestão de Clientes  | 100% (CRUD, Filtros)               |
| Estoque de Veículos | 100% (Listagem, Filtros, Detalhes) |
| Notificações        | 100% (Recebimento, Visualização)   |
| Novo Lead           | 100% (Captura, Validação)          |
| Checklist           | 90% (Leitura dinâmica)             |
| Multi-Empresa       | 100% (Seleção, Troca)              |

### Capacidades Technical

- **Plataformas:** iOS, Android, Web
- **Suporte offline:** AsyncStorage + Cache local
- **Autenticação:** JWT + Secure Store
- **Atualizações:** Soft updates com EAS (Expo)
- **Escalabilidade:** Arquitetura baseada em serviços
- **Testes:** Estrutura preparada para unit/integration tests

---

## 🎯 Casos de Uso Principais

### 1. Vendedor Consultando Movimentações

> Um vendedor precisa ver seu pipeline de vendas com filtros ativos (Status, Momento, Tipo de Negociação)

**Sequência:**

1. Abre app → Login → Seleciona empresa → Vai para Painel
2. Sistema carrega primeiras 10 movimentações
3. Aplica filtros desejados
4. Faz scroll para carregar mais itens
5. Clica em movimentação para detalhes

### 2. Gerenciador Buscando Cliente

> Um gerente precisa localizar um cliente específico pelo nome ou telefone

**Sequência:**

1. Navega para aba "Cliente"
2. Aplica filtro por nome ou telefone
3. Sistema retorna lista paginada
4. Clica em cliente para detalhes

### 3. Responsável por Estoque Consultando Veículos

> Responsável por estoque precisa saber quais veículos estão disponíveis de uma marca específica

**Sequência:**

1. Navega para aba "Estoque"
2. Filtra por marca → modelo → status
3. Visualiza detalhes: ano, KM, cor, valor
4. Clica para ver checklist de avaliação

### 4. Prospector Capturando Novo Lead

> Prospector em campo recebe um contato e precisa registrar rapidamente

**Sequência:**

1. Navega para "Novo Lead"
2. Preenche: Nome, Telefone, Observação
3. Sistema valida e salva localização
4. Recebe confirmação

### 5. Usuário Recebendo Notificação

> Sistema notifica vendedor sobre novo movimento na movimentação

**Sequência:**

1. Usuário recebe push notification
2. Abre app e vê na central de notificações
3. Clica na notificação
4. Sistema leva direto para detalhes da movimentação

---

## 🔄 Fluxo de Desenvolvimento

### Setup Inicial

```bash
# 1. Clonar repositório
git clone <repo-url>

# 2. Instalar dependências
npm install

# 3. Gerar variáveis .env
cp .env.example .env

# 4. Rodar em desenvolvimento
npm run android    # ou npm run ios
```

### Build para Produção

```bash
# EAS Build (Expo-managed)
eas build --platform android --profile production
eas build --platform ios --profile production

# APK/IPA disponível para distribuição
```

---

## 📋 Checklist de Funcionalidades

- [x] Autenticação com CPF + Senha
- [x] Validação de telefone (2FA)
- [x] Login persistente com Secure Store
- [x] Dashboard com paginação e cache
- [x] Filtros avançados no painel
- [x] Gestão de clientes com busca
- [x] Catálogo de estoque com filtros
- [x] Notificações push e locais
- [x] Captura de novo lead
- [x] Visualização de checklist dinâmico
- [x] Navegação multi-empresa
- [x] Sistema de temas (Dark/Light)
- [x] Mascara de dados sensíveis
- [x] Toast notifications para feedback
- [x] Pull-to-refresh em listagens
- [x] Infinite scroll em listagens

---

## 📞 Suporte e Manutenção

**Contato Técnico:** [Desenvolvimento]  
**Versão Documentação:** 1.0.0  
**Data de Atualização:** Março 2026  
**Status:** Production Ready ✅

---

## 📄 Conclusão

O **V4 System** é uma aplicação mobile robusta, bem estruturada e escalável, desenvolvida com as melhores práticas em React Native e TypeScript. O sistema oferece uma experiência intuitiva para vendedores, gestores e prospectors, com funcionalidades completas de CRM integrado a gestão de estoque de veículos.

**Principais Diferenciais:**

- ✅ Arquitetura profissional e escalável
- ✅ Autenticação segura com 2FA
- ✅ Notificações em tempo real
- ✅ Multi-empresa nativa
- ✅ Interface moderna com Dark Mode
- ✅ Performance otimizada com cache inteligente
- ✅ Totalmente offline-capable com AsyncStorage
- ✅ Pronto para produção (EAS + Expo)

---

**Desenvolvido com React Native, Expo e TypeScript**
