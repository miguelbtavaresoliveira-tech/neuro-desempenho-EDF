from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SessaoCreate(BaseModel):
    id_atleta: int = Field(..., description="ID do atleta associado a esta sessão")
    data_sessao: datetime = Field(default_factory=datetime.now, description="Data e hora da realização da sessão")
    foco_sessao: Optional[str] = Field(None, max_length=100, description="Ex: 'Treino de Visão Periférica', 'Controle de Impulso'")
    atividades_realizadas: str = Field(..., description="Descrição detalhada do que rolou no encontro")
    condicao_pre_treino: Optional[str] = Field(None, max_length=50, description="Estado físico/mental inicial do atleta (ex: Cansado, Focado)")
    observacoes_clinicas: Optional[str] = Field(None, description="Anotações do consultor sobre a sessão")

class SessaoResponse(BaseModel):
    id_sessao: int
    id_atleta: int
    data_sessao: datetime
    foco_sessao: Optional[str]
    atividades_realizadas: str
    condicao_pre_treino: Optional[str]
    observacoes_clinicas: Optional[str]

    class Config:
        from_attributes = True
