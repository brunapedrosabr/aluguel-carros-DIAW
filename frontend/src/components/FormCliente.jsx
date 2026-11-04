import { useState } from 'react'
import { formatarMoeda, formatarValorEditavel, lerValor } from '../utils/formatos.js'
import Alerta from './Alerta.jsx'
import Campo from './Campo.jsx'
import Icone from './Icone.jsx'
import KmSecao from './KmSecao.jsx'

const MAX_RENDIMENTOS = 3

function mascararCpf(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

function mascararCep(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function dadosIniciais(cliente) {
  return {
    login: cliente?.login ?? '',
    senha: '',
    confirmacao: '',
    nome: cliente?.nome ?? '',
    cpf: cliente?.cpf ?? '',
    rg: cliente?.rg ?? '',
    logradouro: cliente?.endereco?.logradouro ?? '',
    bairro: cliente?.endereco?.bairro ?? '',
    cidade: cliente?.endereco?.cidade ?? '',
    uf: cliente?.endereco?.uf ?? '',
    cep: cliente?.endereco?.cep ?? '',
    profissao: cliente?.profissao ?? '',
  }
}

function rendimentosIniciais(cliente) {
  if (cliente?.rendimentos?.length) {
    return cliente.rendimentos.map((r) => ({
      entidadeEmpregadora: r.entidadeEmpregadora,
      valor: formatarValorEditavel(r.valor),
    }))
  }
  return [{ entidadeEmpregadora: '', valor: '' }]
}

/**
 * Formulário do cliente, usado em "Criar conta" (modo criar) e "Meu cadastro" (modo editar).
 * `onEnviar` recebe o corpo pronto para a API. Os botões de ação vêm em `children`.
 */
export default function FormCliente({ modo, inicial, onEnviar, erro, children, extra }) {
  const editar = modo === 'editar'
  const [dados, setDados] = useState(() => dadosIniciais(inicial))
  const [rendimentos, setRendimentos] = useState(() => rendimentosIniciais(inicial))
  const [erroLocal, setErroLocal] = useState(null)

  const campos = erro?.campos ?? {}
  const total = rendimentos.reduce((soma, r) => soma + (lerValor(r.valor) ?? 0), 0)

  function alterar(campo, mascara) {
    return (evento) => {
      const valor = mascara ? mascara(evento.target.value) : evento.target.value
      setDados((atual) => ({ ...atual, [campo]: valor }))
    }
  }

  function alterarRendimento(indice, campo, valor) {
    setRendimentos((atual) => atual.map((r, i) => (i === indice ? { ...r, [campo]: valor } : r)))
  }

  function adicionarRendimento() {
    setRendimentos((atual) => (atual.length < MAX_RENDIMENTOS ? [...atual, { entidadeEmpregadora: '', valor: '' }] : atual))
  }

  function removerRendimento(indice) {
    setRendimentos((atual) => atual.filter((_, i) => i !== indice))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErroLocal(null)

    if (!editar && !dados.senha) {
      setErroLocal('Informe uma senha.')
      return
    }
    if (dados.senha !== dados.confirmacao) {
      setErroLocal('As senhas não conferem.')
      return
    }

    const preenchidos = rendimentos.filter((r) => r.entidadeEmpregadora.trim() || r.valor.trim())
    for (const r of preenchidos) {
      if (!r.entidadeEmpregadora.trim()) {
        setErroLocal('Informe a entidade empregadora de cada rendimento.')
        return
      }
      const valor = lerValor(r.valor)
      if (valor === null || valor <= 0) {
        setErroLocal(`Informe um valor válido para o rendimento de "${r.entidadeEmpregadora.trim()}".`)
        return
      }
    }

    await onEnviar({
      login: dados.login.trim(),
      senha: dados.senha || null,
      nome: dados.nome.trim(),
      cpf: dados.cpf,
      rg: dados.rg.trim(),
      endereco: {
        logradouro: dados.logradouro.trim(),
        bairro: dados.bairro.trim(),
        cidade: dados.cidade.trim(),
        uf: dados.uf.trim().toUpperCase(),
        cep: dados.cep,
      },
      profissao: dados.profissao.trim(),
      rendimentos: preenchidos.map((r) => ({
        entidadeEmpregadora: r.entidadeEmpregadora.trim(),
        valor: lerValor(r.valor),
      })),
    })
  }

  return (
    <div className="duas-colunas">
      <div className="principal">
        <form className="pilha" onSubmit={enviar} noValidate>
          <Alerta>{erroLocal ?? erro?.message}</Alerta>

          <KmSecao km={1} titulo="Acesso" descricao="Usuário e senha para entrar no sistema.">
            <div className="grade">
              <Campo
                rotulo="Usuário"
                value={dados.login}
                onChange={alterar('login')}
                placeholder="seu.usuario"
                autoComplete="username"
                required
                erro={campos.login}
              />
              <Campo
                rotulo={editar ? 'Nova senha' : 'Senha'}
                type="password"
                value={dados.senha}
                onChange={alterar('senha')}
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                required={!editar}
              />
              <Campo
                rotulo="Confirmar senha"
                type="password"
                value={dados.confirmacao}
                onChange={alterar('confirmacao')}
                placeholder="Repita a senha"
                autoComplete="new-password"
                required={!editar}
              />
            </div>
            {editar && <p className="dica">Deixe as senhas em branco para manter a atual.</p>}
          </KmSecao>

          <KmSecao km={2} titulo="Identificação" descricao="Dados do contratante do aluguel.">
            <Campo
              rotulo="Nome completo"
              value={dados.nome}
              onChange={alterar('nome')}
              placeholder="Como está no documento"
              autoComplete="name"
              required
              erro={campos.nome}
            />
            <div className="grade">
              <Campo
                rotulo="CPF"
                inputMode="numeric"
                value={dados.cpf}
                onChange={alterar('cpf', mascararCpf)}
                placeholder="000.000.000-00"
                required
                erro={campos.cpf}
              />
              <Campo
                rotulo="RG"
                value={dados.rg}
                onChange={alterar('rg')}
                placeholder="MG-00.000.000"
                required
                erro={campos.rg}
              />
            </div>
          </KmSecao>

          <KmSecao km={3} titulo="Endereço" descricao="Onde você mora atualmente.">
            <Campo
              rotulo="Logradouro e número"
              value={dados.logradouro}
              onChange={alterar('logradouro')}
              placeholder="Rua, avenida… e número"
              autoComplete="street-address"
              required
              erro={campos['endereco.logradouro']}
            />
            <div className="grade estreita">
              <Campo rotulo="Bairro" value={dados.bairro} onChange={alterar('bairro')} />
              <Campo
                rotulo="Cidade"
                value={dados.cidade}
                onChange={alterar('cidade')}
                autoComplete="address-level2"
                required
                erro={campos['endereco.cidade']}
              />
              <Campo
                rotulo="UF"
                value={dados.uf}
                onChange={alterar('uf', (v) => v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
                placeholder="UF"
                autoComplete="address-level1"
                required
                erro={campos['endereco.uf']}
              />
              <Campo
                rotulo="CEP"
                inputMode="numeric"
                value={dados.cep}
                onChange={alterar('cep', mascararCep)}
                placeholder="00000-000"
                autoComplete="postal-code"
                erro={campos['endereco.cep']}
              />
            </div>
          </KmSecao>

          <KmSecao km={4} titulo="Profissão e rendimentos" descricao="Base da análise financeira feita pelos agentes.">
            <Campo
              rotulo="Profissão"
              className="campo-curto"
              value={dados.profissao}
              onChange={alterar('profissao')}
              placeholder="Ex.: Engenheira de software"
              required
              erro={campos.profissao}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="linha-entre">
                <h3 id="titulo-rendimentos" style={{ margin: 0, fontSize: 16 }}>
                  Entidades empregadoras e rendimentos
                </h3>
                <span className="contador">
                  {rendimentos.length} de {MAX_RENDIMENTOS}
                </span>
              </div>

              <ol className="rendimentos" aria-labelledby="titulo-rendimentos">
                {rendimentos.map((rendimento, indice) => (
                  <li className="rendimento" key={indice}>
                    <span className="rendimento-numero" aria-hidden="true">
                      {indice + 1}
                    </span>
                    <Campo
                      rotulo="Entidade empregadora"
                      value={rendimento.entidadeEmpregadora}
                      onChange={(e) => alterarRendimento(indice, 'entidadeEmpregadora', e.target.value)}
                      placeholder="Empresa ou fonte de renda"
                      erro={campos[`rendimentos[${indice}].entidadeEmpregadora`]}
                    />
                    <Campo
                      rotulo="Rendimento mensal (R$)"
                      inputMode="decimal"
                      value={rendimento.valor}
                      onChange={(e) => alterarRendimento(indice, 'valor', e.target.value)}
                      placeholder="0,00"
                      erro={campos[`rendimentos[${indice}].valor`]}
                    />
                    <button
                      type="button"
                      className="btn btn-icone"
                      onClick={() => removerRendimento(indice)}
                      aria-label={`Remover rendimento ${indice + 1}`}
                    >
                      <Icone nome="lixeira" />
                    </button>
                  </li>
                ))}
              </ol>

              {rendimentos.length === 0 && <p className="dica">Nenhum rendimento informado.</p>}
              {rendimentos.length < MAX_RENDIMENTOS ? (
                <button type="button" className="btn btn-tracejado" onClick={adicionarRendimento}>
                  <Icone nome="mais" /> Adicionar rendimento
                </button>
              ) : (
                <Alerta tipo="info">Limite de 3 rendimentos atingido. Remova um para cadastrar outro.</Alerta>
              )}

              <div className="total-linha">
                <span style={{ fontWeight: 600 }}>Renda mensal declarada</span>
                <strong>{formatarMoeda(total)}</strong>
              </div>
            </div>
          </KmSecao>

          <div className="acoes-form">{children}</div>
        </form>
        {extra}
      </div>

      <aside className="lateral resumo" aria-labelledby="titulo-uso">
        <div className="resumo-topo" style={{ paddingBottom: 24 }}>
          <h2 id="titulo-uso">Como seus dados são usados</h2>
          <ul className="lista-icones">
            <li>
              <span className="icone-caixa" aria-hidden="true">
                <Icone nome="usuario" />
              </span>
              <span>
                <strong>Identificação</strong>
                RG, CPF, nome e endereço identificam o contratante do aluguel.
              </span>
            </li>
            <li>
              <span className="icone-caixa" aria-hidden="true">
                <Icone nome="banco" />
              </span>
              <span>
                <strong>Análise financeira</strong>
                Empresas e bancos agentes consultam profissão e rendimentos para emitir o parecer.
              </span>
            </li>
            <li>
              <span className="icone-caixa" aria-hidden="true">
                <Icone nome="documento" />
              </span>
              <span>
                <strong>Até 3 rendimentos</strong>
                Informe as entidades empregadoras e quanto recebe de cada uma.
              </span>
            </li>
          </ul>
        </div>
        <div className="faixa" aria-hidden="true" />
        <div className="resumo-rodape">
          <p>Na tela dos agentes, CPF e RG aparecem parcialmente mascarados.</p>
        </div>
      </aside>
    </div>
  )
}
