from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from controllers.atletaController import router as atleta_router
from controllers.testeController import router as teste_router
from controllers.sessaoController import router as sessao_router
from controllers.resultadoController import router as resultado_router

# Inicia o aplicativo FastAPI
app = FastAPI(
    title="API NeuroSportsTech (EsporteNeural)",
    description="API de monitoramento cognitivo de atletas e análise de dados para ciência do esporte",
    version="1.0.0"
)

# Configura as permissões de CORS para que o React (frontend) consiga se conectar à API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem no desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos HTTP
)

# Registra os routers das entidades do sistema
app.include_router(atleta_router)
app.include_router(teste_router)
app.include_router(sessao_router)
app.include_router(resultado_router)

@app.get("/")
async def testar_servidor():
    """Rota básica para testar se o servidor está no ar"""
    return {
        "mensagem": "Servidor FastAPI do EsporteNeural rodando perfeitamente!",
        "documentacao": "/docs"
    }

@app.get("/db-status")
async def testar_banco():
    """Rota para testar se a conexão com o MySQL deu certo"""
    conn = get_db_connection()
    if conn and conn.is_connected():
        conn.close() # Sempre fechamos a conexão após usar
        return {"status": "Sucesso", "mensagem": "Conectado ao MySQL com sucesso!"}
    
    return {"status": "Erro", "mensagem": "Falha na conexão com o banco de dados."}