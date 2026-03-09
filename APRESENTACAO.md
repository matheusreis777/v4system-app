# V4 System - Apresentação

## 1. Login

- CPF + Senha
- Validação com 4 últimos dígitos do telefone

## 2. Esqueceu Senha

- Recuperação com CPF + 4 últimos dígitos do telefone
- Criar nova senha

## 3. Intro - Seleção de Empresa

- Lista de empresas vinculadas ao login do usuário
- Selecionar empresa para acessar

## 4. Painel - Movimentações

Listagem de movimentações com filtros:

- Status da Movimentação
- Momento
- Tipo de Negociação
- Vendedor
- Placa do Veículo
- Cliente (Nome)
- Telefone

Dados exibidos por movimentação:

- ID da movimentação
- Nome do cliente
- Telefone
- Placa do veículo
- Status
- Momento
- Tipo de negociação
- Vendedor
- Última observação
- Data de inclusão

Ações:

- Visualizar detalhes da movimentação
- Cancelar movimentação (com justificativa)
- Paginação com 10 itens por página

## 5. Estoque - Veículos

Listagem de veículos com filtros:

- Placa
- Tipo de veículo
- Marca
- Modelo
- Status do veículo

Dados exibidos por veículo:

- ID
- Placa
- Status
- Tipo
- Marca
- Modelo
- Ano do modelo
- Ano de fabricação
- KM
- Cor
- Combustível
- Valor de venda

Ações:

- Visualizar detalhes do veículo
- Paginação com 10 itens por página

## 6. Clientes - Lista de Clientes

Listagem de clientes com filtros:

- Nome
- Email
- CPF/CNPJ
- Telefone

Dados exibidos por cliente:

- ID
- Nome
- Email
- CPF/CNPJ
- Telefone

Paginação com 10 itens por página

## 7. Notificações

Listagem de notificações do usuário:

- Título
- Mensagem
- Data de criação
- Status leitura (lida/não lida)

Ações:

- Marcar como lida
- Clicar notificação leva para detalhes da movimentação

## 8. Cadastrar Novo Lead

Formulário com campos:

- Nome (obrigatório)
- Telefone (obrigatório, mínimo 10 dígitos)
- CPF/CNPJ (opcional)
- Observação (obrigatório)

Validação e envio para API

## 9. Detalhes da Movimentação

Exibição completa dos dados da movimentação:

- Nome do cliente
- Telefone
- Placa do veículo
- Status
- Momento
- Tipo de negociação
- Vendedor
- Data de agendamento
- Data de inclusão
- Tipo de qualificação
- Observações

## 10. Detalhes do Veículo

Exibição completa dos dados do veículo:

- Placa
- Status
- Tipo de veículo
- Marca
- Modelo
- Ano do modelo
- Ano de fabricação
- KM
- Cor
- Combustível
- Valor de venda
- Histórico de avaliação (checklist)

## 11. Perfil

- Nome do usuário
- CPF
- Telefone
- Seleção de empresa
- Logout
- Troca de senha

## 12. Autenticação

- Login persistente com token JWT
- Armazenamento seguro de credenciais
- Validação de telefone com 4 últimos dígitos
- Logout com limpeza de sessão
