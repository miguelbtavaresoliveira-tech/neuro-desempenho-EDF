from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum

class PeDominanteEnum(str, Enum):
    direito = "Direito"
    esquerdo = "Esquerdo"
    ambidestro = "Ambidestro"

class AtletaCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, description="Nome completo do jogador")
    data_nascimento: date = Field(..., description="Data de nascimento do atleta (formato YYYY-MM-DD)")
    posicao_tatica: str = Field(..., max_length=50, description="Ex: Zagueiro, Volante, Centroavante")
    pe_dominante: Optional[PeDominanteEnum] = Field(None, description="Pé dominante ('Direito', 'Esquerdo', 'Ambidestro')")
    clube_atual: Optional[str] = Field(None, max_length=100, description="Clube atual do atleta")

class AtletaResponse(BaseModel):
    id_atleta: int
    nome: str
    data_nascimento: date
    posicao_tatica: str
    pe_dominante: Optional[PeDominanteEnum]
    clube_atual: Optional[str]
    data_cadastro: datetime

    class Config:
        from_attributes = True

class AtletaPerfilResponse(BaseModel):
    atleta: AtletaResponse
    total_sessoes: int
    mensagem: Optional[str] = None
