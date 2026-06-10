from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ResultadoCreate(BaseModel):
    id_sessao: int = Field(..., description="ID da sessão vinculada")
    id_teste: int = Field(..., description="ID do tipo de teste executado")
    momento_execucao: datetime = Field(default_factory=datetime.now, description="Data e hora exata da tentativa")
    nivel_dificuldade: Optional[int] = Field(1, ge=1, description="Nível configurado no sistema (1, 2, 3...)")
    valor_obtido: float = Field(..., description="Valor bruto principal do teste (ex: tempo em ms)")
    taxa_precisao: Optional[float] = Field(None, ge=0.0, le=100.0, description="Taxa de acerto em porcentagem (0-100)")
    quantidade_erros: Optional[int] = Field(0, ge=0, description="Quantidade de falhas cometidas na rodada")
    fadiga_estimada: Optional[int] = Field(None, ge=1, le=10, description="Nível de fadiga autorrelatado pelo atleta (1 a 10)")

class ResultadoResponse(BaseModel):
    id_resultado: int
    id_sessao: int
    id_teste: int
    momento_execucao: datetime
    nivel_dificuldade: int
    valor_obtido: float
    taxa_precisao: Optional[float]
    quantidade_erros: int
    fadiga_estimada: Optional[int]

    class Config:
        from_attributes = True

# Modelos auxiliares para Ciência de Dados e Relatórios

class MediaSessaoResponse(BaseModel):
    id_sessao: int
    id_teste: int
    nome_teste: str
    unidade_medida: str
    media_valor_obtido: float
    media_taxa_precisao: Optional[float]
    total_erros: int
    media_fadiga: Optional[float]
    total_tentativas: int

class RelatorioEvolutivoPoint(BaseModel):
    data_sessao: datetime
    id_sessao: int
    valor_obtido: float
    taxa_precisao: Optional[float]
    quantidade_erros: int
    fadiga_estimada: Optional[int]

class RelatorioEvolutivoResponse(BaseModel):
    id_atleta: int
    nome_atleta: str
    id_teste: int
    nome_teste: str
    unidade_medida: str
    pontos_evolucao: List[RelatorioEvolutivoPoint]
