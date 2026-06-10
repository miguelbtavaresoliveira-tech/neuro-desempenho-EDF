from database import get_db_connection
from models.atletaModel import AtletaCreate
from mysql.connector import Error

def cadastrar_atleta_service(atleta: AtletaCreate):
    """Insere um novo atleta no banco de dados e retorna o ID gerado"""
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        INSERT INTO tb_atletas (nome, data_nascimento, posicao_tatica, pe_dominante, clube_atual)
        VALUES (%s, %s, %s, %s, %s)
        """
        valores = (
            atleta.nome,
            atleta.data_nascimento,
            atleta.posicao_tatica,
            atleta.pe_dominante.value if atleta.pe_dominante else None,
            atleta.clube_atual
        )
        cursor.execute(query, valores)
        conn.commit()
        
        atleta_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return atleta_id
    except Error as e:
        print(f"Erro no banco de dados ao cadastrar atleta: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def listar_atletas_service(posicao: str = None, clube: str = None):
    """Busca atletas com possibilidade de filtros dinâmicos de posição e clube"""
    conn = get_db_connection()
    if conn is None:
        return []
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM tb_atletas WHERE 1=1"
        valores = []
        
        if posicao:
            query += " AND posicao_tatica LIKE %s"
            valores.append(f"%{posicao}%")
        if clube:
            query += " AND clube_atual LIKE %s"
            valores.append(f"%{clube}%")
            
        cursor.execute(query, valores)
        atletas = cursor.fetchall()
        cursor.close()
        conn.close()
        return atletas
    except Error as e:
        print(f"Erro ao listar atletas: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return []

def buscar_perfil_atleta_service(id_atleta: int):
    """Busca perfil completo do atleta e o total de sessões já realizadas por ele"""
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Puxa dados biográficos
        query_atleta = "SELECT * FROM tb_atletas WHERE id_atleta = %s"
        cursor.execute(query_atleta, (id_atleta,))
        atleta_dados = cursor.fetchone()
        
        if not atleta_dados:
            cursor.close()
            conn.close()
            return None
            
        # 2. Puxa contagem de sessões (análise simples de volumetria)
        query_sessoes = "SELECT COUNT(*) as total_sessoes FROM tb_sessoes_consultoria WHERE id_atleta = %s"
        cursor.execute(query_sessoes, (id_atleta,))
        sessoes_dados = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {
            "atleta": atleta_dados,
            "total_sessoes": sessoes_dados["total_sessoes"] if sessoes_dados else 0
        }
    except Error as e:
        print(f"Erro ao buscar perfil do atleta: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None
