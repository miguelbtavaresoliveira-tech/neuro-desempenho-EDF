from fastapi import APIRouter, HTTPException, status
from models.sessaoModel import SessaoCreate, SessaoResponse
from services.sessaoServices import iniciar_sessao_service, buscar_historico_sessoes_service
from typing import List

router = APIRouter(prefix="/api/sessoes", tags=["Sessões de Consultoria"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def iniciar_sessao(sessao: SessaoCreate):
    """
    Inicia uma sessão de consultoria para um atleta.
    Retorna o id_sessao criado para que os resultados das tentativas
    possam ser vinculados a ele na sequência.
    """
    sessao_id = iniciar_sessao_service(sessao)
    if sessao_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao registrar o início da sessão. Verifique as chaves estrangeiras."
        )
    return {"id_sessao": sessao_id, "mensagem": "Sessão de consultoria iniciada com sucesso!"}

@router.get("/atleta/{id_atleta}", response_model=List[SessaoResponse])
async def buscar_historico_sessoes(id_atleta: int):
    """
    Retorna a lista cronológica reversa de sessões que um atleta já realizou.
    Permite visualizar o histórico de foco, atividades e observações clínicas.
    """
    return buscar_historico_sessoes_service(id_atleta)
