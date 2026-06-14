import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FolderPlus, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

function Testes() {
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [nomeTeste, setNomeTeste] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('ms');

  // Feedback states
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [criando, setCriando] = useState(false);

  const carregarTestes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await api.testes.listar();
      setTestes(dados);
    } catch (e) {
      setErro(`Falha ao conectar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTestes();
  }, []);

  const handleCriar = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCriando(true);

    if (!nomeTeste || !unidadeMedida) {
      setErro('Nome do teste e unidade de medida são obrigatórios.');
      setCriando(false);
      return;
    }

    try {
      const dadosTeste = {
        nome_teste: nomeTeste,
        descricao: descricao || null,
        unidade_medida: unidadeMedida
      };
      
      const resposta = await api.testes.criar(dadosTeste);
      setSucesso(resposta.mensagem || 'Teste cadastrado com sucesso!');
      
      // Reset form
      setNomeTeste('');
      setDescricao('');
      setUnidadeMedida('ms');
      
      carregarTestes();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCriando(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Catálogo Cognitivo</h1>
      <p className="page-subtitle">Gerencie as dinâmicas e testes neurocognitivos disponíveis para aplicar nos jogadores.</p>

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

      <div className="grid-main-sidebar">
        {/* Painel Esquerdo: Lista de Testes Cadastrados */}
        <div className="card">
          <div className="card-title-container">
            <h3>Testes Cadastrados ({testes.length})</h3>
          </div>

          {loading && testes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Carregando catálogo...</p>
          ) : testes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Nenhum teste no catálogo.</p>
          ) : (
            <div className="grid-2">
              {testes.map((teste) => (
                <div key={teste.id_teste} className="card" style={{ padding: '1.25rem', marginBottom: 0, background: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{teste.nome_teste}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', minHeight: '40px' }}>
                    {teste.descricao || 'Sem descrição cadastrada.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-foot" style={{ fontSize: '0.7rem' }}>
                      Unidade: <strong>{teste.unidade_medida}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Criado em {new Date(teste.data_inclusao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel Direito: Cadastrar Novo Teste */}
        <div className="card">
          <div className="card-title-container">
            <h3>Nova Dinâmica</h3>
          </div>

          <form onSubmit={handleCriar}>
            <div className="form-group">
              <label className="form-label">Nome do Teste</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Tempo de Reação de Luzes"
                value={nomeTeste}
                onChange={(e) => setNomeTeste(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unidade de Medida</label>
              <select 
                value={unidadeMedida} 
                onChange={(e) => setUnidadeMedida(e.target.value)}
              >
                <option value="ms">Milissegundos (ms)</option>
                <option value="%">Taxa de Acerto (%)</option>
                <option value="segundos">Segundos (s)</option>
                <option value="pontos">Pontuação (pts)</option>
                <option value="erros">Quantidade de Erros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição das Regras</label>
              <textarea 
                className="form-control" 
                rows="4"
                placeholder="Descreva detalhadamente como o atleta executa o teste, quais cores deve tocar, o que deve ignorar..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={criando}
            >
              <FolderPlus size={18} />
              {criando ? 'Salvando...' : 'Cadastrar Teste'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Testes;
