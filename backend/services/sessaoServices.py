from database import get_db_connection
from models.sessaoModel import SessaoCreate
from mysql.connector import Error

def iniciar_sessao_service(sessao: SessaoCreate):
    """Cria um registro de sessão no banco e retorna o ID gerado"""
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        INSERT INTO tb_sessoes_consultoria 
        (id_atleta, data_sessao, foco_sessao, atividades_realizadas, condicao_pre_treino, observacoes_clinicas)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        valores = (
            sessao.id_atleta,
            sessao.data_sessao,
            sessao.foco_sessao,
            sessao.atividades_realizadas,
            sessao.condicao_pre_treino,
            sessao.observacoes_clinicas
        )
        cursor.execute(query, valores)
        conn.commit()
        
        sessao_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return sessao_id
    except Error as e:
        print(f"Erro ao iniciar sessão: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def buscar_historico_sessoes_service(id_atleta: int):
    """Puxa todas as sessões realizadas por um atleta específico"""
    conn = get_db_connection()
    if conn is None:
        return []
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT * FROM tb_sessoes_consultoria 
        WHERE id_atleta = %s 
        ORDER BY data_sessao DESC
        """
        cursor.execute(query, (id_atleta,))
        sessoes = cursor.fetchall()
        cursor.close()
        conn.close()
        return sessoes
    except Error as e:
        print(f"Erro ao buscar histórico de sessões: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return []
