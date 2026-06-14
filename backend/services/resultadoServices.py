from database import get_db_connection
from models.resultadoModel import ResultadoCreate
from mysql.connector import Error
import datetime

# Tentamos importar o pandas. Se não estiver instalado, tratamos o erro graciosamente
# para que o servidor continue funcionando e explique ao usuário como instalar.
try:
    import pandas as pd
except ImportError:
    pd = None

def salvar_tentativa_service(resultado: ResultadoCreate):
    """Insere o resultado bruto de uma tentativa individual no banco de dados"""
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        INSERT INTO tb_resultados 
        (id_sessao, id_teste, momento_execucao, nivel_dificuldade, valor_obtido, taxa_precisao, quantidade_erros, fadiga_estimada)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            resultado.id_sessao,
            resultado.id_teste,
            resultado.momento_execucao,
            resultado.nivel_dificuldade,
            resultado.valor_obtido,
            resultado.taxa_precisao,
            resultado.quantidade_erros,
            resultado.fadiga_estimada
        )
        cursor.execute(query, valores)
        conn.commit()
        
        resultado_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return resultado_id
    except Error as e:
        print(f"Erro ao salvar tentativa de teste: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def calcular_media_sessao_service(id_sessao: int, id_teste: int):
    """
    Roda uma query com funções de agregação SQL (AVG, SUM, COUNT)
    para consolidar a performance do atleta na sessão de hoje.
    """
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT 
            r.id_sessao, 
            r.id_teste, 
            t.nome_teste, 
            t.unidade_medida,
            AVG(r.valor_obtido) as media_valor_obtido,
            AVG(r.taxa_precisao) as media_taxa_precisao,
            SUM(r.quantidade_erros) as total_erros,
            AVG(r.fadiga_estimada) as media_fadiga,
            COUNT(r.id_resultado) as total_tentativas
        FROM tb_resultados r
        INNER JOIN tb_tipos_teste t ON r.id_teste = t.id_teste
        WHERE r.id_sessao = %s AND r.id_teste = %s
        GROUP BY r.id_sessao, r.id_teste, t.nome_teste, t.unidade_medida
        """
        cursor.execute(query, (id_sessao, id_teste))
        resultado = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not resultado:
            return None
            
        # Converter valores decimais/floats para tipos python nativos
        return {
            "id_sessao": int(resultado["id_sessao"]),
            "id_teste": int(resultado["id_teste"]),
            "nome_teste": resultado["nome_teste"],
            "unidade_medida": resultado["unidade_medida"],
            "media_valor_obtido": float(resultado["media_valor_obtido"]) if resultado["media_valor_obtido"] is not None else 0.0,
            "media_taxa_precisao": float(resultado["media_taxa_precisao"]) if resultado["media_taxa_precisao"] is not None else None,
            "total_erros": int(resultado["total_erros"]) if resultado["total_erros"] is not None else 0,
            "media_fadiga": float(resultado["media_fadiga"]) if resultado["media_fadiga"] is not None else None,
            "total_tentativas": int(resultado["total_tentativas"])
        }
    except Error as e:
        print(f"Erro ao calcular média da sessão: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def gerar_relatorio_evolutivo_service(id_atleta: int, id_teste: int):
    """
    Busca todas as tentativas de um atleta para um teste específico ao longo do tempo.
    Isso fornece a massa de dados (série temporal) que o frontend precisa para gráficos.
    """
    conn = get_db_connection()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Puxa dados do atleta
        cursor.execute("SELECT nome FROM tb_atletas WHERE id_atleta = %s", (id_atleta,))
        atleta = cursor.fetchone()
        if not atleta:
            cursor.close()
            conn.close()
            return None
            
        # 2. Puxa dados do teste
        cursor.execute("SELECT nome_teste, unidade_medida FROM tb_tipos_teste WHERE id_teste = %s", (id_teste,))
        teste = cursor.fetchone()
        if not teste:
            cursor.close()
            conn.close()
            return None

        # 3. Puxa a série histórica de resultados do atleta neste teste
        query_resultados = """
        SELECT 
            s.data_sessao, 
            r.id_sessao, 
            r.valor_obtido, 
            r.taxa_precisao, 
            r.quantidade_erros, 
            r.fadiga_estimada
        FROM tb_resultados r
        INNER JOIN tb_sessoes_consultoria s ON r.id_sessao = s.id_sessao
        WHERE s.id_atleta = %s AND r.id_teste = %s
        ORDER BY s.data_sessao ASC, r.momento_execucao ASC
        """
        cursor.execute(query_resultados, (id_atleta, id_teste))
        linhas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        pontos = []
        for l in linhas:
            pontos.append({
                "data_sessao": l["data_sessao"],
                "id_sessao": l["id_sessao"],
                "valor_obtido": float(l["valor_obtido"]),
                "taxa_precisao": float(l["taxa_precisao"]) if l["taxa_precisao"] is not None else None,
                "quantidade_erros": int(l["quantidade_erros"]),
                "fadiga_estimada": int(l["fadiga_estimada"]) if l["fadiga_estimada"] is not None else None
            })
            
        return {
            "id_atleta": id_atleta,
            "nome_atleta": atleta["nome"],
            "id_teste": id_teste,
            "nome_teste": teste["nome_teste"],
            "unidade_medida": teste["unidade_medida"],
            "pontos_evolucao": pontos
        }
    except Error as e:
        print(f"Erro ao gerar relatório evolutivo: {e}")
        if conn.is_connected():
            cursor.close()
            conn.close()
        return None

def analisar_dados_pandas_service(id_atleta: int, id_teste: int):
    """
    MÉTODO DE CIÊNCIA DE DADOS (PANDAS):
    Puxa a série temporal de tentativas do atleta e faz análises estatísticas robustas
    (média móvel, correlação fadiga x performance, taxa de melhoria).
    """
    if pd is None:
        return {
            "erro": "Pandas não está instalado no ambiente Python.",
            "dica": "Para habilitar esta análise, execute: pip install pandas"
        }
        
    relatorio = gerar_relatorio_evolutivo_service(id_atleta, id_teste)
    if not relatorio or not relatorio["pontos_evolucao"]:
        return {
            "mensagem": "Sem dados suficientes para análise estatística.",
            "total_tentativas_analisadas": 0
        }
        
    # Carrega a lista de tentativas em um Pandas DataFrame
    df = pd.DataFrame(relatorio["pontos_evolucao"])
    
    # 1. Estatísticas descritivas básicas usando Pandas
    contagem = int(df["valor_obtido"].count())
    menor_valor = float(df["valor_obtido"].min()) # Melhor tempo de reação
    maior_valor = float(df["valor_obtido"].max())
    media_geral = float(df["valor_obtido"].mean())
    desvio_padrao = float(df["valor_obtido"].std()) if contagem > 1 else 0.0
    
    # 2. Média Móvel (Rolling Mean) - Janela de 5 tentativas para suavizar ruído
    # É muito útil em ciência de dados para ver a real tendência sem ser afetado por um piscar de olhos lento
    df["media_movel"] = df["valor_obtido"].rolling(window=5, min_periods=1).mean()
    df["media_movel"] = df["media_movel"].round(2)
    
    # 3. Correlação de Pearson entre Fadiga Autorrelatada e Performance (valor obtido)
    # Correlação varia entre -1 e 1.
    # Ex: se der 0.7, significa que quanto mais cansado (fadiga alta), maior é o tempo de reação (pior).
    correlacao_fadiga_tempo = None
    if "fadiga_estimada" in df.columns and df["fadiga_estimada"].notna().sum() > 2:
        # Converter para float para o pandas calcular correlação
        df["fadiga_estimada"] = df["fadiga_estimada"].astype(float)
        corr = df["valor_obtido"].corr(df["fadiga_estimada"])
        correlacao_fadiga_tempo = float(corr) if not pd.isna(corr) else None

    # 4. Taxa de Melhoria (%) comparando a média das primeiras 3 tentativas com as últimas 3
    taxa_melhoria_percentual = 0.0
    if contagem >= 4:
        media_inicial = df["valor_obtido"].head(3).mean()
        media_final = df["valor_obtido"].tail(3).mean()
        
        # Como em tempo de reação MENOS tempo é MELHOR, se o valor final for menor que o inicial, houve melhora.
        if media_inicial > 0:
            # Fórmula da melhora (se for tempo, diminuir é melhorar)
            if relatorio["unidade_medida"].lower() in ["ms", "segundos", "s"]:
                taxa_melhoria_percentual = float(((media_inicial - media_final) / media_inicial) * 100)
            else:
                # Se for precisão ou acertos, aumentar é melhorar
                taxa_melhoria_percentual = float(((media_final - media_inicial) / media_inicial) * 100)
                
    # Cria uma lista formatada da série com a média móvel inserida para retornar ao frontend
    df["data_sessao"] = df["data_sessao"].astype(str) # Converter datetime para string para JSON
    serie_analisada = df[["data_sessao", "valor_obtido", "media_movel", "quantidade_erros"]].to_dict(orient="records")
    
    return {
        "atleta": relatorio["nome_atleta"],
        "teste": relatorio["nome_teste"],
        "unidade_medida": relatorio["unidade_medida"],
        "total_tentativas_analisadas": contagem,
        "estatisticas": {
            "melhor_resultado": menor_valor,
            "pior_resultado": maior_valor,
            "media_aritmetica": round(media_geral, 2),
            "desvio_padrao": round(desvio_padrao, 2),
            "taxa_melhoria_estimada_percentual": round(taxa_melhoria_percentual, 1)
        },
        "analise_correlacao": {
            "correlação_fadiga_versus_tempo_reacao": round(correlacao_fadiga_tempo, 3) if correlacao_fadiga_tempo is not None else None,
            "interpretacao": interpretar_correlacao(correlacao_fadiga_tempo)
        },
        "dados_serie_temporal": serie_analisada
    }

def interpretar_correlacao(valor):
    """Função auxiliar de Ciência de Dados para explicar a correlação ao usuário"""
    if valor is None:
        return "Dados de fadiga insuficientes para correlacionar."
        
    abs_v = abs(valor)
    direcao = "positiva (ambos crescem juntos)" if valor > 0 else "negativa (quando um cresce o outro diminui)"
    
    if abs_v < 0.2:
        forca = "desprezível ou nenhuma"
    elif abs_v < 0.4:
        forca = "fraca"
    elif abs_v < 0.7:
        forca = "moderada"
    else:
        forca = "forte"
        
    msg = f"Correlação {forca} e {direcao}. "
    
    if valor > 0.3:
        msg += "Sugere que a fadiga de fato aumenta o tempo de reação (desempenho piora com cansaço)."
    elif valor < -0.3:
        msg += "Sugere que o atleta reage mais rápido mesmo reportando fadiga (incomum, necessita investigação)."
    else:
        msg += "A fadiga autorrelatada não parece impactar significativamente os tempos de reação neste teste."
        
    return msg
