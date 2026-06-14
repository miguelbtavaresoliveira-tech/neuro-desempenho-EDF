import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, TrendingUp, Info, Activity, Brain, AlertCircle } from 'lucide-react';

function DashboardAnalise() {
  const [atletas, setAtletas] = useState([]);
  const [testes, setTestes] = useState([]);
  
  const [idAtleta, setIdAtleta] = useState('');
  const [idTeste, setIdTeste] = useState('');

  // Estados para dados analíticos
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega atletas e testes na montagem
  useEffect(() => {
    const inicializar = async () => {
      try {
        const dadosAtletas = await api.atletas.listar();
        const dadosTestes = await api.testes.listar();
        setAtletas(dadosAtletas);
        setTestes(dadosTestes);
        
        // Auto-seleciona os primeiros se houver dados
        if (dadosAtletas.length > 0) setIdAtleta(dadosAtletas[0].id_atleta.toString());
        if (dadosTestes.length > 0) setIdTeste(dadosTestes[0].id_teste.toString());
      } catch (e) {
        setErro(`Erro ao carregar dados iniciais: ${e.message}`);
      }
    };
    inicializar();
  }, []);

  // Busca análises do Pandas no backend sempre que o atleta ou teste selecionado muda
  const carregarAnalise = async () => {
    if (!idAtleta || !idTeste) return;
    setLoading(true);
    setErro(null);
    try {
      const dados = await api.resultados.obterAnalisePandas(parseInt(idAtleta), parseInt(idTeste));
      setAnalise(dados);
    } catch (e) {
      setErro(e.message);
      setAnalise(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAnalise();
  }, [idAtleta, idTeste]);

  return (
    <div>
      <h1 className="page-title">Ciência de Dados & Performance</h1>
      <p className="page-subtitle">Analise a evolução cognitiva dos jogadores por meio de estatísticas descritivas, médias móveis e coeficientes de correlação.</p>

      {/* Barra de Filtros / Seletores */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Selecionar Jogador</label>
            <select 
              value={idAtleta} 
              onChange={(e) => setIdAtleta(e.target.value)}
            >
              <option value="">-- Escolha um Atleta --</option>
              {atletas.map(a => (
                <option key={a.id_atleta} value={a.id_atleta}>{a.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Selecionar Teste</label>
            <select 
              value={idTeste} 
              onChange={(e) => setIdTeste(e.target.value)}
            >
              <option value="">-- Escolha um Teste --</option>
              {testes.map(t => (
                <option key={t.id_teste} value={t.id_teste}>{t.nome_teste} ({t.unidade_medida})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {erro && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Executando cálculos estatísticos no Pandas...</p>
        </div>
      ) : !analise || !analise.estatisticas || analise.total_tentativas_analisadas === 0 ? (
        /* Caso sem dados */
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Activity size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', margin: '0 auto' }} />
          <h3 style={{ marginTop: '1rem' }}>Sem Dados Suficientes</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto' }}>
            Este atleta ainda não tem tentativas registradas para este teste. Vá até a aba <strong>Treino</strong>, inicie uma sessão e simule algumas tentativas!
          </p>
        </div>
      ) : (
        /* Caso com dados: Dashboard de Data Science */
        <div>
          {/* Cartões Estatísticos (Estatísticas Descritivas) */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {/* Média Aritmética */}
            <div className="card" style={{ marginBottom: 0, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Média Geral</span>
                <BarChart2 size={16} />
              </div>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary-hover)' }}>
                {analise.estatisticas.media_aritmetica} <span style={{ fontSize: '1rem', fontWeight: 500 }}>{analise.unidade_medida}</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Tempo médio em {analise.total_tentativas_analisadas} tentativas.
              </p>
            </div>

            {/* Desvio Padrão */}
            <div className="card" style={{ marginBottom: 0, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Desvio Padrão</span>
                <Activity size={16} />
              </div>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-warning)' }}>
                ± {analise.estatisticas.desvio_padrao} <span style={{ fontSize: '1rem', fontWeight: 500 }}>{analise.unidade_medida}</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Mede a consistência: menor variação = atleta mais estável.
              </p>
            </div>

            {/* Taxa de Melhoria */}
            <div className="card" style={{ marginBottom: 0, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Evolução</span>
                <TrendingUp size={16} />
              </div>
              <p style={{ 
                fontSize: '2.2rem', 
                fontWeight: 800, 
                color: analise.estatisticas.taxa_melhoria_estimada_percentual >= 0 ? 'var(--color-secondary)' : 'var(--color-accent)' 
              }}>
                {analise.estatisticas.taxa_melhoria_estimada_percentual >= 0 ? '+' : ''}
                {analise.estatisticas.taxa_melhoria_estimada_percentual}%
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Comparação entre o início e o fim da série de treinos.
              </p>
            </div>
          </div>

          {/* Área Principal: Gráfico Recharts */}
          <div className="card">
            <div className="card-title-container">
              <div>
                <h3>Gráfico de Série Temporal & Tendência</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Compare os valores individuais (ruído) com a <strong>Média Móvel de 5 períodos</strong> (curva suavizada de tendência).
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <LineChart
                  data={analise.dados_serie_temporal}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="data_sessao" 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    tickFormatter={(tick) => {
                      try {
                        const d = new Date(tick);
                        return `${d.getDate()}/${d.getMonth()+1}`;
                      } catch {
                        return tick;
                      }
                    }}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    name={`Tentativa Individual (${analise.unidade_medida})`} 
                    type="monotone" 
                    dataKey="valor_obtido" 
                    stroke="hsla(158, 64%, 52%, 0.4)" 
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    name={`Média Móvel (Tendência)`} 
                    type="monotone" 
                    dataKey="media_movel" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3} 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Painel Científico: Correlação de Pearson */}
          <div className="grid-main-sidebar">
            {/* Esquerda: Correlação */}
            <div className="card" style={{ background: 'linear-gradient(135deg, hsl(240, 16%, 12%), hsl(240, 16%, 10%))' }}>
              <div className="card-title-container">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={20} style={{ color: 'var(--color-primary-hover)' }} />
                  Correlação de Pearson (Fadiga x Desempenho)
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '120px', height: '120px', 
                  borderRadius: '50%', 
                  border: '6px solid var(--color-primary)', 
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Coeficiente</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {analise.analise_correlacao.correlação_fadiga_versus_tempo_reacao !== null 
                      ? analise.analise_correlacao.correlação_fadiga_versus_tempo_reacao.toFixed(2)
                      : 'N/A'}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ color: 'var(--color-warning)' }}>Interpretação do Cientista de Dados:</h4>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {analise.analise_correlacao.interpretacao}
                  </p>
                </div>
              </div>
            </div>

            {/* Direita: Dicionário do Aluno */}
            <div className="card">
              <div className="card-title-container">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Info size={16} style={{ color: 'var(--color-secondary)' }} />
                  Aprenda Ciência de Dados!
                </h3>
              </div>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <strong>Média Móvel:</strong> Ao calcular a média móvel (ex: últimas 5 tentativas), eliminamos "outliers" (como uma piscada lenta acidental) e focamos na tendência central de fadiga.
                </li>
                <li>
                  <strong>Desvio Padrão:</strong> Mostra o quanto o atleta oscila. Em esportes de elite, consistência (baixo desvio padrão) é tão importante quanto recordes.
                </li>
                <li>
                  <strong>Correlação (R):</strong> Mede o vínculo entre duas variáveis de -1 a +1. Se R &gt; 0.3, significa que quando o atleta se sente cansado (fadiga alta), ele reage visivelmente mais devagar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAnalise;
