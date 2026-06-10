from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TesteCreate(BaseModel):
    nome_teste: str = Field(..., min_length=2, max_length=100, description="Nome da dinâmica/teste cognitivo")
    descricao: Optional[str] = Field(None, description="Explicação detalhada de como funciona o teste")
    unidade_medida: str = Field(..., max_length=20, description="Ex: 'ms' (milissegundos), '%' (precisão), 'segundos'")

class TesteResponse(BaseModel):
    id_teste: int
    nome_teste: str
    descricao: Optional[str]
    unidade_medida: str
    data_inclusao: datetime

    class Config:
        from_attributes = True
