# Histórias do Usuário — Rodar

Cada história indica o caso de uso relacionado ([diagrama](diagramas/casos-de-uso.svg)) e onde ela está implementada.

## Cliente

### US01 — Cadastrar-se · UC01
**Como** pessoa interessada em alugar um carro, **quero** criar minha conta **para** poder usar o sistema.

Critérios de aceitação:
- Informo usuário, senha (mín. 6 caracteres), nome, CPF, RG, endereço, profissão e até 3 rendimentos.
- Não é possível usar um usuário ou CPF já cadastrado.
- Ao concluir, entro automaticamente no sistema.

Implementação: `POST /api/auth/registrar` · tela **Criar conta**.

### US02 — Fazer login · UC02
**Como** usuário cadastrado, **quero** entrar com usuário e senha **para** acessar as funções do meu perfil.

Critérios de aceitação:
- Sem login, nenhuma tela ou rota da API (exceto login e cadastro) fica acessível.
- Clientes vão para "Meus pedidos"; agentes vão para a "Fila de análise".
- Credenciais inválidas mostram a mensagem "Usuário ou senha inválidos.".

Implementação: `POST /api/auth/login` (token JWT) · tela **Login**.

### US03 — Consultar e atualizar meu cadastro · UC03
**Como** cliente, **quero** ver e corrigir meus dados **para** que a análise financeira use informações atuais.

Critérios de aceitação:
- Posso alterar qualquer dado; a senha só muda se eu preencher uma nova.
- Posso ter no máximo 3 rendimentos; o total mensal é calculado automaticamente.

Implementação: `GET/PUT /api/clientes/me` · tela **Meu cadastro**.

### US04 — Excluir meu cadastro · UC04
**Como** cliente, **quero** excluir minha conta **para** remover meus dados do sistema.

Critérios de aceitação:
- Não é possível excluir com pedidos em andamento (em análise ou aprovados) nem com contratos executados.
- Após excluir, volto para a tela de login.

Implementação: `DELETE /api/clientes/me` · tela **Meu cadastro**.

### US05 — Introduzir pedido de aluguel · UC05
**Como** cliente, **quero** escolher um automóvel e um período **para** pedir um aluguel.

Critérios de aceitação:
- A devolução deve ser depois da retirada, e a retirada não pode estar no passado.
- Não é possível pedir um automóvel já reservado no mesmo período.
- Informo em nome de quem o carro será registrado (cliente, empresa ou banco).
- O pedido começa com o status **Em análise**.

Implementação: `POST /api/pedidos` · tela **Novo pedido**.

### US06 — Solicitar contrato de crédito · UC06
**Como** cliente, **quero** associar um contrato de crédito de um banco ao aluguel **para** financiá-lo.

Critérios de aceitação:
- Escolho um dos bancos agentes.
- O registro do automóvel em nome do banco só é permitido com contrato de crédito.
- Um pedido com crédito só pode ser avaliado pelo banco escolhido.

Implementação: campo `bancoCreditoId` do pedido · seção **KM 03** da tela **Novo pedido**.

### US07 — Consultar pedidos e status · UC07
**Como** cliente, **quero** acompanhar meus pedidos **para** saber em que etapa cada um está.

Critérios de aceitação:
- Vejo o andamento (enviado → análise → parecer → contrato), o parecer do agente e os dados do contrato.
- Posso filtrar o histórico por status.

Implementação: `GET /api/pedidos` e `GET /api/pedidos/{id}` · tela **Meus pedidos**.

### US08 — Modificar pedido · UC08
**Como** cliente, **quero** alterar um pedido ainda em análise **para** corrigir carro, datas ou crédito.

Critérios de aceitação:
- Só pedidos **Em análise** podem ser modificados.
- As mesmas validações do pedido novo são aplicadas.

Implementação: `PUT /api/pedidos/{id}` · tela **Modificar pedido**.

### US09 — Cancelar pedido · UC09
**Como** cliente, **quero** cancelar um pedido **para** desistir do aluguel.

Critérios de aceitação:
- Posso cancelar pedidos **Em análise** ou com **Parecer positivo** (antes do contrato).
- Pedidos cancelados liberam o automóvel no período.

Implementação: `PATCH /api/pedidos/{id}/cancelar` · botão **Cancelar pedido**.

## Agente (empresa ou banco)

### US10 — Consultar fila de análise · UC10
**Como** agente, **quero** ver os pedidos aguardando parecer **para** organizar minhas análises.

Critérios de aceitação:
- Vejo contratante, renda declarada, veículo e se há crédito.
- Pedidos com crédito aparecem apenas para o banco escolhido.
- CPF e RG do contratante aparecem parcialmente mascarados.

Implementação: `GET /api/agente/pedidos?status=` · tela **Fila de análise**.

### US11 — Modificar pedido (agente) · UC08
**Como** agente, **quero** ajustar datas ou o registro do veículo de um pedido em análise **para** viabilizar o contrato.

Implementação: `PUT /api/agente/pedidos/{id}` · link **Modificar pedido** no painel do agente.

### US12 — Avaliar pedido · UC11
**Como** agente, **quero** emitir um parecer positivo ou negativo com justificativa **para** registrar a análise financeira.

Critérios de aceitação:
- Só pedidos **Em análise** podem receber parecer, e a justificativa é obrigatória.
- O pedido passa para **Parecer positivo** ou **Parecer negativo**.

Implementação: `POST /api/agente/pedidos/{id}/parecer`.

### US13 — Executar contrato · UC12 e UC13
**Como** agente que aprovou o pedido, **quero** executar o contrato **para** concluir o aluguel.

Critérios de aceitação:
- Só o agente que emitiu o parecer positivo pode executar o contrato.
- Se o pedido tem crédito, é gerado um contrato de crédito com o banco.
- O pedido passa para **Contrato executado** e não pode mais ser cancelado.

Implementação: `POST /api/agente/pedidos/{id}/contrato` · método `Contrato.executar(...)`.
