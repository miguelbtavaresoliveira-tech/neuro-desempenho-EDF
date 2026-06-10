from fastapi import APIRouter, HTTPException, Query, status
from models.atletaModel import AtletaCreate, AtletaResponse, AtletaPerfilResponse
from services.atletaServices import cadastrar_atleta_service, listar_atletas_service, buscar_perfil_atleta_service
from typing import List, Optional

# Criamos o Router com prefixo e tags para organização automática na documentação do Swagger
router = APIRouter(prefix="/api/atletas", tags=["Atletas"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def cadastrar_atleta(atleta: AtletaCreate):
    """
    Cadastra um novo atleta.
    Recebe um JSON validado pelo Pydantic e faz a inserção no banco MySQL.
    """
    atleta_id = cadastrar_atleta_service(atleta)
    if atleta_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro ao cadastrar atleta. Verifique a conexão com o banco de dados."
        )
    return {"id_atleta": atleta_id, "mensagem": "Atleta cadastrado com sucesso!"}

@router.get("", response_model=List[AtletaResponse])
async def listar_atletas(
    posicao: Optional[str] = Query(None, description="Filtrar por posição tática (busca parcial)"),
    clube: Optional[str] = Query(None, description="Filtrar por clube atual (busca parcial)")
):
    """
    Retorna a lista de atletas cadastrados.
    Permite filtrar por clube ou posição tática via Query Parameters na URL.
    Ex: /api/atletas?posicao=Zagueiro
    """
    return listar_atletas_service(posicao=posicao, clube=clube)

@router.get("/{id_atleta}", response_model=AtletaPerfilResponse)
async def buscar_perfil_atleta(id_atleta: int):
    """
    Busca o prontuário/perfil biológico de um atleta específico
    e retorna o número total de sessões que ele já realizou no sistema.
    """
    perfil = buscar_perfil_atleta_service(id_atleta)
    if perfil is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Atleta com ID {id_atleta} não encontrado no sistema."
        )
    return perfil