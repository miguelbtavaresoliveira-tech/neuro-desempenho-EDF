// Base URL do Servidor FastAPI
// Como a porta 8000 costuma entrar em conflito no Windows, o backend está configurado para a porta 8001 por padrão.
const API_BASE_URL = 'http://localhost:8001';

/**
 * Helper genérico para tratar respostas HTTP e erros
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erro HTTP ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // ATLETAS
  atletas: {
    listar: async (posicao = '', clube = '') => {
      const params = new URLSearchParams();
      if (posicao) params.append('posicao', posicao);
      if (clube) params.append('clube', clube);
      
      const res = await fetch(`${API_BASE_URL}/api/atletas?${params.toString()}`);
      return handleResponse(res);
    },
    
    buscarPorId: async (idAtleta) => {
      const res = await fetch(`${API_BASE_URL}/api/atletas/${idAtleta}`);
      return handleResponse(res);
    },
    
    cadastrar: async (dadosAtleta) => {
      const res = await fetch(`${API_BASE_URL}/api/atletas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtleta),
      });
      return handleResponse(res);
    }
  },

  // TESTES COGNITIVOS (CATÁLOGO)
  testes: {
    listar: async () => {
      const res = await fetch(`${API_BASE_URL}/api/testes`);
      return handleResponse(res);
    },
    
    criar: async (dadosTeste) => {
      const res = await fetch(`${API_BASE_URL}/api/testes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosTeste),
      });
      return handleResponse(res);
    }
  },

  // SESSÕES DE CONSULTORIA
  sessoes: {
    listarPorAtleta: async (idAtleta) => {
      const res = await fetch(`${API_BASE_URL}/api/sessoes/atleta/${idAtleta}`);
      return handleResponse(res);
    },
    
    iniciar: async (dadosSessao) => {
      const res = await fetch(`${API_BASE_URL}/api/sessoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosSessao),
      });
      return handleResponse(res);
    }
  },

  // RESULTADOS E CIÊNCIA DE DADOS
  resultados: {
    salvarTentativa: async (dadosTentativa) => {
      const res = await fetch(`${API_BASE_URL}/api/resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosTentativa),
      });
      return handleResponse(res);
    },
    
    obterMediaSessao: async (idSessao, idTeste) => {
      const res = await fetch(`${API_BASE_URL}/api/resultados/media?id_sessao=${idSessao}&id_teste=${idTeste}`);
      return handleResponse(res);
    },
    
    obterEvolucao: async (idAtleta, idTeste) => {
      const res = await fetch(`${API_BASE_URL}/api/resultados/evolucao?id_atleta=${idAtleta}&id_teste=${idTeste}`);
      return handleResponse(res);
    },
    
    obterAnalisePandas: async (idAtleta, idTeste) => {
      const res = await fetch(`${API_BASE_URL}/api/resultados/analise-pandas?id_atleta=${idAtleta}&id_teste=${idTeste}`);
      return handleResponse(res);
    }
  }
};
