from fastapi import APIRouter, HTTPException, Query, status
from models.resultadoModel import ResultadoCreate, ResultadoResponse, MediaSessaoResponse, RelatorioEvolutivoResponse
from services.resultadoServices import (
    salvar_tentativa_service, 
    calcular_media_sessao_service, 
    gerar_relatorio_evolutivo_service,
    analisar_dados_pandas_service
)
from typing import List

router = APIRouter(prefix="/api/resultados", tags=["Resultados & Análise"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def salvar_tentativa(resultado: ResultadoCreate):
    """
    Salva uma nova tentativa individual executada pelo atleta.
    Registra tempo de reação, erros, fadiga e dificuldade em tempo real.
    """
    resultado_id = salvar_tentativa_service(resultado)
    if resultado_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar a tentativa do teste. Verifique a validade dos IDs da sessão e teste."
        )
    return {"id_resultado": resultado_id, "mensagem": "Tentativa registrada com sucesso!"}

@router.get("/media", response_model=MediaSessaoResponse)
async def calcular_media_sessao(
    id_sessao: int = Query(..., description="ID da sessão específica"),
    id_teste: int = Query(..., description="ID do teste cognitivo")
):
    """
    Calcula as médias agregadas da sessão para um teste específico.
    Usa funções de agregação SQL básicas (AVG, SUM, COUNT).
    """
    media = calcular_media_sessao_service(id_sessao, id_teste)
    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sem dados para a combinação de sessão e teste informados."
        )
    return media

@router.get("/evolucao", response_model=RelatorioEvolutivoResponse)
async def gerar_relatorio_evolutivo(
    id_atleta: int = Query(..., description="ID do atleta"),
    id_teste: int = Query(..., description="ID do teste cognitivo")
):
    """
    Retorna a série histórica de todas as tentativas do atleta naquele teste.
    Útil para traçar gráficos de linha temporais no front-end.
    """
    relatorio = gerar_relatorio_evolutivo_service(id_atleta, id_teste)
    if relatorio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não foram encontrados registros para o atleta ou teste fornecidos."
        )
    return relatorio

@router.get("/analise-pandas")
async def obter_analise_pandas(
    id_atleta: int = Query(..., description="ID do atleta"),
    id_teste: int = Query(..., description="ID do teste cognitivo")
):
    """
    [MÉTODO DE CIÊNCIA DE DADOS]
    Lê a série histórica do atleta, monta um Pandas DataFrame, calcula a média móvel,
    desvio padrão, correlação fadiga-desempenho e taxa de melhora de forma estatística.
    """
    analise = analisar_dados_pandas_service(id_atleta, id_teste)
    if "erro" in analise:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=analise
        )
    return analise