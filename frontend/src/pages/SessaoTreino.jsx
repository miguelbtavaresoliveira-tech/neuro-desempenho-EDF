import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Play, Clipboard, Save, Award, RefreshCw, XCircle, AlertCircle, CheckCircle, Zap } from 'lucide-react';

function SessaoTreino() {
  // Dados do Catálogo
  const [atletas, setAtletas] = useState([]);
  const [testes, setTestes] = useState([]);
  
  // Controle de Sessão
  const [idAtleta, setIdAtleta] = useState('');
  const [focoSessao, setFocoSessao] = useState('');
  const [atividades, setAtividades] = useState('');
  const [condicaoPre, setCondicaoPre] = useState('Focado');
  const [observacoes, setObservacoes] = useState('');
  
  // Sessão Ativa
  const [sessaoAtiva, setSessaoAtiva] = useState(null); // Armazena objeto da sessão ativa
  const [historicoTentativas, setHistoricoTentativas] = useState([]);

  // Lógica de Inserção de Tentativa
  const [idTesteSelecionado, setIdTesteSelecionado] = useState('');
  const [nivelDificuldade, setNivelDificuldade] = useState(1);
  const [valorObtido, setValorObtido] = useState('');
  const [taxaPrecisao, setTaxaPrecisao] = useState(100);
  const [quantidadeErros, setQuantidadeErros] = useState(0);
  const [fadigaEstimada, setFadigaEstimada] = useState(3);

  // Consolidação (Média) da Sessão
  const [mediaSessao, setMediaSessao] = useState(null);

  // Feedback states
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carrega atletas e testes na montagem
  useEffect(() => {
    const inicializar = async () => {
      try {
        const dadosAtletas = await api.atletas.listar();
        const dadosTestes = await api.testes.listar();
        setAtletas(dadosAtletas);
        setTestes(dadosTestes);
        if (dadosTestes.length > 0) {
          setIdTesteSelecionado(dadosTestes[0].id_teste.toString());
        }
      } catch (e) {
        setErro(`Erro ao carregar dados iniciais: ${e.message}`);
      }
    };
    inicializar();
  }, []);

  // Inicia a sessão no banco
  const handleIniciarSessao = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    if (!idAtleta || !atividades) {
      setErro('Selecione um atleta e descreva as atividades da sessão.');
      setLoading(false);
      return;
    }

    try {
      const dadosSessao = {
        id_atleta: parseInt(idAtleta),
        data_sessao: new Date().toISOString(),
        foco_sessao: focoSessao || null,
        atividades_realizadas: atividades,
        condicao_pre_treino: condicaoPre,
        observacoes_clinicas: observacoes || null
      };

      const res = await api.sessoes.iniciar(dadosSessao);
      const atletaSelecionado = atletas.find(a => a.id_atleta === parseInt(idAtleta));
      
      setSessaoAtiva({
        id_sessao: res.id_sessao,
        atleta: atletaSelecionado,
        foco_sessao: focoSessao
      });
      
      setSucesso(`Sessão #${res.id_sessao} iniciada para ${atletaSelecionado.nome}!`);
      setHistoricoTentativas([]);
      setMediaSessao(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Salva uma tentativa individual no backend
  const handleSalvarTentativa = async (e) => {
    if (e) e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!idTesteSelecionado) {
      setErro('Selecione um teste do catálogo.');
      return;
    }

    try {
      const dadosTentativa = {
        id_sessao: sessaoAtiva.id_sessao,
        id_teste: parseInt(idTesteSelecionado),
        momento_execucao: new Date().toISOString(),
        nivel_dificuldade: parseInt(nivelDificuldade),
        valor_obtido: parseFloat(valorObtido),
        taxa_precisao: parseFloat(taxaPrecisao),
        quantidade_erros: parseInt(quantidadeErros),
        fadiga_estimada: parseInt(fadigaEstimada)
      };

      const res = await api.resultados.salvarTentativa(dadosTentativa);
      
      // Adiciona localmente para a tabela de histórico recente
      const teste = testes.find(t => t.id_teste === parseInt(idTesteSelecionado));
      setHistoricoTentativas(prev => [
        {
          id_resultado: res.id_resultado,
          teste: teste.nome_teste,
          unidade: teste.unidade_medida,
          ...dadosTentativa
        },
        ...prev
      ]);

      setSucesso('Tentativa registrada com sucesso!');
      
      // Limpa os campos de inserção para o próximo clique
      setValorObtido('');
      setQuantidadeErros(0);
      // Mantém dificuldade e fadiga pois costumam ser similares durante o treino
    } catch (e) {
      setErro(e.message);
    }
  };

  // Simula uma tentativa realista para poupar tempo e gerar massa de dados para o Pandas!
  const handleSimularTentativa = () => {
    if (!idTesteSelecionado) {
      setErro('Selecione um teste para simular.');
      return;
    }
    
    const testeObj = testes.find(t => t.id_teste === parseInt(idTesteSelecionado));
    let valorSimulado;
    let precisaoSimulada;
    let errosSimulados;

    if (testeObj.unidade_medida === 'ms') {
      // Simular tempo de reação realista entre 180ms e 380ms
      valorSimulado = (Math.random() * 200 + 180).toFixed(2);
      errosSimulados = Math.floor(Math.random() * 3);
      precisaoSimulada = (100 - (errosSimulados * 15)).toFixed(2);
    } else if (testeObj.unidade_medida === '%') {
      precisaoSimulada = (Math.random() * 20 + 80).toFixed(2);
      valorSimulado = precisaoSimulada;
      errosSimulados = Math.floor(Math.random() * 4);
    } else {
      valorSimulado = (Math.random() * 10 + 5).toFixed(2);
      precisaoSimulada = 100;
      errosSimulados = 0;
    }

    // Fadiga randômica próxima ao padrão
    const fadigaSimulada = Math.min(10, Math.max(1, fadigaEstimada + Math.floor(Math.random() * 3) - 1));

    // Atualiza estados e salva
    setValorObtido(valorSimulado);
    setTaxaPrecisao(precisaoSimulada);
    setQuantidadeErros(errosSimulados);
    setFadigaEstimada(fadigaSimulada);

    // Como os estados demoram um ciclo para atualizar, enviamos diretamente
    setTimeout(() => {
      setValorObtido(valorSimulado);
      setTaxaPrecisao(precisaoSimulada);
      setQuantidadeErros(errosSimulados);
      setFadigaEstimada(fadigaSimulada);
      
      // Auto-salvamento
      const dadosTentativa = {
        id_sessao: sessaoAtiva.id_sessao,
        id_teste: parseInt(idTesteSelecionado),
        momento_execucao: new Date().toISOString(),
        nivel_dificuldade: parseInt(nivelDificuldade),
        valor_obtido: parseFloat(valorSimulado),
        taxa_precisao: parseFloat(precisaoSimulada),
        quantidade_erros: parseInt(errosSimulados),
        fadiga_estimada: parseInt(fadigaSimulada)
      };

      api.resultados.salvarTentativa(dadosTentativa).then(res => {
        setHistoricoTentativas(prev => [
          {
            id_resultado: res.id_resultado,
            teste: testeObj.nome_teste,
            unidade: testeObj.unidade_medida,
            ...dadosTentativa
          },
          ...prev
        ]);
        setSucesso(`[Simulação] Tentativa salva: ${valorSimulado} ${testeObj.unidade_medida}!`);
        setValorObtido('');
      }).catch(err => setErro(err.message));
    }, 50);
  };

  // Executa o cálculo de média da sessão pelo endpoint agregador SQL
  const handleCalcularMedias = async () => {
    if (!idTesteSelecionado || historicoTentativas.length === 0) {
      setErro('Nenhuma tentativa registrada para calcular a média.');
      return;
    }
    setErro(null);
    try {
      const dados = await api.resultados.obterMediaSessao(sessaoAtiva.id_sessao, parseInt(idTesteSelecionado));
      setMediaSessao(dados);
      setSucesso('Médias consolidadas pelo banco com sucesso!');
    } catch (e) {
      setErro(e.message);
    }
  };

  // Encerra a sessão ativa na tela
  const handleFinalizarSessao = () => {
    setSessaoAtiva(null);
    setHistoricoTentativas([]);
    setMediaSessao(null);
    setIdAtleta('');
    setFocoSessao('');
    setAtividades('');
    setObservacoes('');
    setSucesso('Sessão encerrada e arquivada.');
  };

  return (
    <div>
      <h1 className="page-title">Sessão de Treino</h1>
      <p className="page-subtitle">Abra uma nova sessão de consultoria para o atleta e registre as tentativas em tempo real.</p>

      {erro && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}
      {sucesso && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{sucesso}</span>
        </div>
      )}

      {/* CASO NÃO HAJA SESSÃO ATIVA: Form de Abertura */}
      {!sessaoAtiva ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-title-container">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={20} style={{ color: 'var(--color-secondary)' }} />
              Iniciar Novo Atendimento
            </h3>
          </div>

          <form onSubmit={handleIniciarSessao}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Selecionar Atleta</label>
                <select 
                  value={idAtleta} 
                  onChange={(e) => setIdAtleta(e.target.value)}
                  required
                >
                  <option value="">-- Selecione o Jogador --</option>
                  {atletas.map(a => (
                    <option key={a.id_atleta} value={a.id_atleta}>{a.nome} ({a.clube_atual || 'Sem Clube'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Foco do Treino</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Visão Periférica, Controle de Impulso"
                  value={focoSessao}
                  onChange={(e) => setFocoSessao(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Condição Pré-Treino</label>
                <select 
                  value={condicaoPre} 
                  onChange={(e) => setCondicaoPre(e.target.value)}
                >
                  <option value="Focado">Excelente / Focado</option>
                  <option value="Normal">Normal</option>
                  <option value="Fatigado">Fatigado / Cansado</option>
                  <option value="Ansioso">Ansioso</option>
                  <option value="Recuperação">Pós-jogo / Recuperação</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Atividades Realizadas</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: 5 rounds de estimulação luminosa + feedback verbal"
                  value={atividades}
                  onChange={(e) => setAtividades(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observações Iniciais</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Anotações adicionais de comportamento ou postura (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              <Play size={18} />
              {loading ? 'Abrindo Sessão...' : 'Iniciar Atendimento'}
            </button>
          </form>
        </div>
      ) : (
        /* CASO EXISTA SESSÃO ATIVA: Registrar Tentativas */
        <div className="grid-main-sidebar">
          {/* Coluna Esquerda: Registro e Histórico */}
          <div>
            {/* Banner da Sessão Ativa */}
            <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={20} className="spin-animation" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <strong>Sessão Ativa #{sessaoAtiva.id_sessao}</strong> — Atleta: <strong>{sessaoAtiva.atleta.nome}</strong> 
                  {sessaoAtiva.foco_sessao && ` (${sessaoAtiva.foco_sessao})`}
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleFinalizarSessao} style={{ padding: '0.4rem 0.8rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}>
                <XCircle size={14} style={{ marginRight: '4px' }} />
                Encerrar
              </button>
            </div>

            {/* Histórico Recente de Tentativas da Sessão */}
            <div className="card">
              <div className="card-title-container">
                <h3>Tentativas Realizadas nesta Sessão</h3>
              </div>

              {historicoTentativas.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  Nenhuma tentativa registrada nesta sessão ainda. Use o painel ao lado para registrar ou simular dados.
                </p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Teste</th>
                        <th>Dificuldade</th>
                        <th>Valor</th>
                        <th>Precisão</th>
                        <th>Erros</th>
                        <th>Fadiga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoTentativas.map((t, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{t.teste}</td>
                          <td>Nível {t.nivel_dificuldade}</td>
                          <td>
                            <span className="badge badge-foot" style={{ fontSize: '0.85rem' }}>
                              {t.valor_obtido} {t.unidade}
                            </span>
                          </td>
                          <td>{t.taxa_precisao}%</td>
                          <td style={{ color: t.quantidade_erros > 0 ? 'var(--color-accent)' : 'inherit' }}>
                            {t.quantidade_erros} {t.quantidade_erros === 1 ? 'erro' : 'erros'}
                          </td>
                          <td>Fadiga: {t.fadiga_estimada}/10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Consolidado da Sessão (Médias calculadas no Backend) */}
            {mediaSessao && (
              <div className="card" style={{ background: 'linear-gradient(135deg, hsl(240, 16%, 12%), hsl(262, 83%, 12%))' }}>
                <div className="card-title-container">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={20} style={{ color: 'var(--color-warning)' }} />
                    Média de Desempenho da Sessão (SQL Aggregated)
                  </h3>
                </div>

                <div className="grid-3">
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Valor Médio</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-hover)' }}>
                      {mediaSessao.media_valor_obtido.toFixed(2)} <span style={{ fontSize: '1rem' }}>{mediaSessao.unidade_medida}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Precisão Média</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                      {mediaSessao.media_taxa_precisao ? `${mediaSessao.media_taxa_precisao.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total de Erros</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                      {mediaSessao.total_erros} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>erros</span>
                    </p>
                  </div>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                  Nota média de fadiga reportada pelo atleta: <strong>{mediaSessao.media_fadiga ? mediaSessao.media_fadiga.toFixed(1) : 'N/A'} / 10</strong> em <strong>{mediaSessao.total_tentativas} tentativas</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Coluna Direita: Registrar Nova Tentativa */}
          <div>
            <div className="card">
              <div className="card-title-container">
                <h3>Lançar Tentativa</h3>
              </div>

              <form onSubmit={handleSalvarTentativa}>
                <div className="form-group">
                  <label className="form-label">Selecionar Teste</label>
                  <select 
                    value={idTesteSelecionado} 
                    onChange={(e) => {
                      setIdTesteSelecionado(e.target.value);
                      setMediaSessao(null); // Reseta médias anteriores
                    }}
                    required
                  >
                    {testes.map(t => (
                      <option key={t.id_teste} value={t.id_teste}>{t.nome_teste} ({t.unidade_medida})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nível de Dificuldade (1 a 5)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    min="1" max="5"
                    value={nivelDificuldade}
                    onChange={(e) => setNivelDificuldade(e.target.value)}
                    required
                  />
                </div>

                {/* Simulador Inteligente de Cliques de Hardware */}
                <div style={{ padding: '1rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '8px', border: '1px dashed var(--color-primary)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-hover)' }}>GERADOR DE DADOS</span>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleSimularTentativa}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--color-primary)', border: 'none', color: 'white' }}
                    >
                      <Zap size={12} style={{ marginRight: '4px' }} />
                      Simular Clique
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Para facilitar, clique no botão acima para simular dados de reação em milissegundos e erros automaticamente para o atleta!
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Valor Obtido ({testes.find(t => t.id_teste === parseInt(idTesteSelecionado))?.unidade_medida || 'ms'})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control"
                    placeholder="Ex: 240.5"
                    value={valorObtido}
                    onChange={(e) => setValorObtido(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Precisão (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={taxaPrecisao}
                      onChange={(e) => setTaxaPrecisao(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Erros</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={quantidadeErros}
                      onChange={(e) => setQuantidadeErros(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Fadiga Autorrelatada ({fadigaEstimada}/10)</label>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    value={fadigaEstimada}
                    onChange={(e) => setFadigaEstimada(parseInt(e.target.value))}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  <Save size={16} />
                  Salvar Manualmente
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={handleCalcularMedias}
                  disabled={historicoTentativas.length === 0}
                >
                  <RefreshCw size={16} />
                  Calcular Média Geral
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessaoTreino;
