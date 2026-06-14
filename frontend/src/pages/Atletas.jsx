import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserPlus, Search, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

function Atletas() {
  // Estados para listagem e filtros
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroPosicao, setFiltroPosicao] = useState('');
  const [filtroClube, setFiltroClube] = useState('');
  
  // Estados para o formulário de cadastro
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [posicaoTatica, setPosicaoTatica] = useState('');
  const [peDominante, setPeDominante] = useState('Direito');
  const [clubeAtual, setClubeAtual] = useState('');
  
  // Estados de feedback visual
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [cadastrando, setCadastrando] = useState(false);

  // Carrega atletas do backend
  const carregarAtletas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await api.atletas.listar(filtroPosicao, filtroClube);
      setAtletas(dados);
    } catch (e) {
      setErro(`Falha ao conectar com o servidor: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carrega sempre que o componente monta ou que os filtros mudam
  useEffect(() => {
    carregarAtletas();
  }, [filtroPosicao, filtroClube]);

  // Executa o envio do formulário para o backend
  const handleCadastrar = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCadastrando(true);

    // Validação básica frontend
    if (!nome || !dataNascimento || !posicaoTatica) {
      setErro('Nome, data de nascimento e posição tática são obrigatórios.');
      setCadastrando(false);
      return;
    }

    try {
      const dadosAtleta = {
        nome,
        data_nascimento: dataNascimento,
        posicao_tatica: posicaoTatica,
        pe_dominante: peDominante,
        clube_atual: clubeAtual || null
      };
      
      const resposta = await api.atletas.cadastrar(dadosAtleta);
      setSucesso(resposta.mensagem || 'Atleta cadastrado com sucesso!');
      
      // Reseta formulário
      setNome('');
      setDataNascimento('');
      setPosicaoTatica('');
      setPeDominante('Direito');
      setClubeAtual('');
      
      // Atualiza lista
      carregarAtletas();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCadastrando(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Gestão de Atletas</h1>
      <p className="page-subtitle">Cadastre e gerencie a ficha biográfica dos jogadores sob sua consultoria neurocognitiva.</p>

      {/* Feedbacks de Sucesso ou Erro */}
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
        {/* Painel Esquerdo: Lista de Atletas cadastrados */}
        <div className="card">
          <div className="card-title-container">
            <h3>Jogadores Cadastrados ({atletas.length})</h3>
            <button className="btn btn-secondary" onClick={carregarAtletas} style={{ padding: '0.4rem 0.8rem' }} title="Recarregar dados">
              <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            </button>
          </div>

          {/* Filtros */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="Filtrar por Posição (ex: Zagueiro)"
                  value={filtroPosicao}
                  onChange={(e) => setFiltroPosicao(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="Filtrar por Clube"
                  value={filtroClube}
                  onChange={(e) => setFiltroClube(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          {loading && atletas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Carregando atletas...</p>
          ) : atletas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Nenhum atleta encontrado.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Nascimento</th>
                    <th>Posição</th>
                    <th>Pé Dominante</th>
                    <th>Clube</th>
                  </tr>
                </thead>
                <tbody>
                  {atletas.map((atleta) => (
                    <tr key={atleta.id_atleta}>
                      <td style={{ fontWeight: 600 }}>{atleta.nome}</td>
                      <td>{new Date(atleta.data_nascimento).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span className="badge badge-foot" style={{ backgroundColor: 'hsla(158, 64%, 52%, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                          {atleta.posicao_tatica}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-foot">
                          {atleta.pe_dominante || 'Não definido'}
                        </span>
                      </td>
                      <td>
                        {atleta.clube_atual ? (
                          <span className="badge badge-clube">{atleta.clube_atual}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sem Clube</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Painel Direito: Formulário de Cadastro */}
        <div className="card">
          <div className="card-title-container">
            <h3>Novo Atleta</h3>
          </div>

          <form onSubmit={handleCadastrar}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Neymar Jr."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input 
                type="date" 
                className="form-control" 
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Posição Tática</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Volante, Centroavante, Ponta"
                value={posicaoTatica}
                onChange={(e) => setPosicaoTatica(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pé Dominante</label>
              <select 
                value={peDominante} 
                onChange={(e) => setPeDominante(e.target.value)}
              >
                <option value="Direito">Direito</option>
                <option value="Esquerdo">Esquerdo</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clube Atual</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Santos FC (Deixe vazio se for amador)"
                value={clubeAtual}
                onChange={(e) => setClubeAtual(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={cadastrando}
            >
              <UserPlus size={18} />
              {cadastrando ? 'Cadastrando...' : 'Cadastrar Atleta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Atletas;
