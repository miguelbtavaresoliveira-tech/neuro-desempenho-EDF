from database import get_db_connection
from models.testeModel import TesteCreate
from mysql.connector import Error

def criar_teste_service(teste: TesteCreate):
    """Cria um novo tipo de teste/dinâmica cognitiva no catálogo"""
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        INSERT INTO tb_tipos_teste (nome_teste, descricao, unidade_medida)
        VALUES (%s, %s, %s)
        """
        valores = (teste.nome_teste, teste.descricao, teste.unidade_medida)
        cursor.execute(query, valores)
        conn.commit()
        
        teste_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return teste_id
    except Error as e:
        print(f"Erro ao criar novo teste: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def listar_testes_service():
    """Retorna todos os testes cadastrados no sistema"""
    conn = get_db_connection()
    if conn is None:
        return []
        
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tb_tipos_teste ORDER BY nome_teste ASC")
        testes = cursor.fetchall()
        cursor.close()
        conn.close()
        return testes
    except Error as e:
        print(f"Erro ao listar testes: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return []
