# sportNeural 🧠⚽

O **sportNeural** é uma API REST de alta performance desenvolvida para a intersecção entre **Ciência de Dados, Educação Física e Neurociência**. O sistema foi projetado para gerenciar atletas e coletar/processar dados de tempo de reação e fadiga cognitiva central.

## 🚀 Tecnologias Utilizadas
* **Python** (Linguagem base)
* **FastAPI** (Framework web moderno, rápido e de alta performance)
* **MySQL** (Banco de dados relacional para consistência de dados)
* **Pydantic** (Validação de dados rigorosa)
* **Uvicorn** (Servidor ASGI de velocidade extrema)

## 🏗️ Arquitetura do Projeto
O projeto foi estruturado seguindo o padrão **MVC (Model-View-Controller)** adaptado para a filosofia do FastAPI, garantindo a separação de responsabilidades:
* `models/`: Camada de validação de dados com Pydantic.
* `services/`: Onde reside a lógica de negócios e as consultas (queries) ao MySQL.
* `controllers/`: Gerenciamento das rotas da API (`APIRouter`).

## 🛠️ Como rodar o projeto localmente
1. Clone o repositório
2. Entre na pasta do backend: `cd backend`
3. Instale as dependências: `pip install -r requirements.txt`
4. Execute o servidor: `python -m uvicorn main:app --reload`
5. Acesse a documentação automática do Swagger em: `http://127.0.0.1:8000/docs`