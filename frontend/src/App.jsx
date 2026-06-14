import React, { useState } from 'react';
import { User, Activity, Play, BarChart2 } from 'lucide-react';

// Importando as páginas que iremos criar na sequência
import Atletas from './pages/Atletas';
import Testes from './pages/Testes';
import SessaoTreino from './pages/SessaoTreino';
import DashboardAnalise from './pages/DashboardAnalise';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Função para renderizar a página correspondente à aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'atletas':
        return <Atletas />;
      case 'testes':
        return <Testes />;
      case 'treino':
        return <SessaoTreino />;
      case 'dashboard':
      default:
        return <DashboardAnalise />;
    }
  };

  return (
    <div className="app-container">
      {/* Barra de Cabeçalho / Navbar */}
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-text">EsporteNeural</span>
          <span className="logo-badge">NeuroScience</span>
        </div>
        
        {/* Abas de Navegação */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 size={16} />
            Análise
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'atletas' ? 'active' : ''}`}
            onClick={() => setActiveTab('atletas')}
          >
            <User size={16} />
            Atletas
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'testes' ? 'active' : ''}`}
            onClick={() => setActiveTab('testes')}
          >
            <Activity size={16} />
            Catálogo
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'treino' ? 'active' : ''}`}
            onClick={() => setActiveTab('treino')}
          >
            <Play size={16} />
            Treino
          </button>
        </nav>
      </header>

      {/* Conteúdo Dinâmico Principal */}
      <main className="app-main">
        {renderContent()}
      </main>

      {/* Rodapé da Aplicação */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} EsporteNeural - Tecnologia e Neurociência aplicada ao Desempenho Esportivo</p>
      </footer>
    </div>
  );
}

export default App;
