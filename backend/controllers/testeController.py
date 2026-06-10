from fastapi import APIRouter, HTTPException, status
from models.testeModel import TesteCreate, TesteResponse
from services.testeServices import criar_teste_service, listar_testes_service
from typing import List

router = APIRouter(prefix="/api/testes", tags=["Catálogo de Testes"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def criar_teste(teste: TesteCreate):
    """
    Registra uma nova dinâmica cognitiva no catálogo do sistema.
    Ex: Teste de Stroop, Teste de Reação de Cores.
    """
    teste_id = criar_teste_service(teste)
    if teste_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro ao registrar novo tipo de teste cognitivo. Verifique o banco."
        )
    return {"id_teste": teste_id, "mensagem": "Novo teste registrado com sucesso no catálogo!"}

@router.get("", response_model=List[TesteResponse])
async def listar_testes():
    """
    Retorna a lista de todas as dinâmicas cognitivas cadastradas no sistema.
    Útil para preencher comboboxes/seletores no aplicativo móvel.
    """
    return listar_testes_service()
