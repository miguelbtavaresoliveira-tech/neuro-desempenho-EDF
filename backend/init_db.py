import mysql.connector
from mysql.connector import Error

def inicializar_banco():
    # Parâmetros de conexão do MySQL (conforme configurado em database.py)
    host = 'localhost'
    user = 'miguel'
    password = '@MUSOYR#&EJDU@U*2'
    db_name = 'SportNeural'

    print("=== Inicializando Banco de Dados EsporteNeural ===")
    
    # Passo 1: Conectar ao MySQL sem especificar a database para criá-la caso não exista
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Cria a database se ela não existir
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Sucesso: Banco de dados '{db_name}' verificado/criado.")
            
            cursor.close()
            connection.close()
    except Error as e:
        print(f"Erro ao conectar ao servidor MySQL para criar o banco de dados: {e}")
        print("Certifique-se de que o MySQL está rodando e a senha está correta.")
        return

    # Passo 2: Conectar diretamente ao banco criado para definir as tabelas
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=db_name
        )
        if connection.is_connected():
            cursor = connection.cursor()
            
            # DDL 1: Tabela de Atletas
            tabela_atletas = """
            CREATE TABLE IF NOT EXISTS tb_atletas (
                id_atleta INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                data_nascimento DATE NOT NULL,
                posicao_tatica VARCHAR(50) NOT NULL,
                pe_dominante ENUM('Direito', 'Esquerdo', 'Ambidestro'),
                clube_atual VARCHAR(100),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
            """
            cursor.execute(tabela_atletas)
            print("Tabela 'tb_atletas' verificada/criada.")

            # DDL 2: Tabela de Tipos de Teste (Catálogo Cognitivo)
            tabela_testes = """
            CREATE TABLE IF NOT EXISTS tb_tipos_teste (
                id_teste INT AUTO_INCREMENT PRIMARY KEY,
                nome_teste VARCHAR(100) NOT NULL, 
                descricao TEXT,
                unidade_medida VARCHAR(20) NOT NULL,
                data_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
            """
            cursor.execute(tabela_testes)
            print("Tabela 'tb_tipos_teste' verificada/criada.")

            # DDL 3: Tabela de Sessões (Prontuário)
            tabela_sessoes = """
            CREATE TABLE IF NOT EXISTS tb_sessoes_consultoria (
                id_sessao INT AUTO_INCREMENT PRIMARY KEY,
                id_atleta INT NOT NULL,
                data_sessao DATETIME NOT NULL,
                foco_sessao VARCHAR(100),
                atividades_realizadas TEXT NOT NULL,
                condicao_pre_treino VARCHAR(50), 
                observacoes_clinicas TEXT,
                FOREIGN KEY (id_atleta) REFERENCES tb_atletas(id_atleta) ON DELETE CASCADE
            ) ENGINE=InnoDB;
            """
            cursor.execute(tabela_sessoes)
            print("Tabela 'tb_sessoes_consultoria' verificada/criada.")

            # DDL 4: Tabela de Resultados
            tabela_resultados = """
            CREATE TABLE IF NOT EXISTS tb_resultados (
                id_resultado INT AUTO_INCREMENT PRIMARY KEY,
                id_sessao INT NOT NULL,
                id_teste INT NOT NULL,
                momento_execucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nivel_dificuldade INT DEFAULT 1,
                valor_obtido DECIMAL(10,2) NOT NULL,
                taxa_precisao DECIMAL(5,2),
                quantidade_erros INT DEFAULT 0,
                fadiga_estimada INT,
                FOREIGN KEY (id_sessao) REFERENCES tb_sessoes_consultoria(id_sessao) ON DELETE CASCADE,
                FOREIGN KEY (id_teste) REFERENCES tb_tipos_teste(id_teste)
            ) ENGINE=InnoDB;
            """
            cursor.execute(tabela_resultados)
            print("Tabela 'tb_resultados' verificada/criada.")
            
            # Opcional: Inserir alguns testes cognitivos padrão se a tabela estiver vazia para facilitar os testes iniciais
            cursor.execute("SELECT COUNT(*) FROM tb_tipos_teste")
            if cursor.fetchone()[0] == 0:
                testes_iniciais = [
                    ("Teste de Tempo de Reação Simples (Luzes)", "Mede o tempo de resposta em milissegundos a um estímulo luminoso verde.", "ms"),
                    ("Teste de Visão Periférica", "Mede o tempo de reação a estímulos nas bordas laterais da tela.", "ms"),
                    ("Controle de Impulso (Go/No-Go)", "Atleta deve tocar apenas em alvos de cores específicas, ignorando as outras.", "% acerto")
                ]
                cursor.executemany(
                    "INSERT INTO tb_tipos_teste (nome_teste, descricao, unidade_medida) VALUES (%s, %s, %s)", 
                    testes_iniciais
                )
                connection.commit()
                print("Inserido catálogo básico de testes padrão (3 dinâmicas cognitivas).")

            print("\n=== Inicialização concluída com sucesso! Banco pronto para uso. ===")
            
            cursor.close()
            connection.close()
    except Error as e:
        print(f"Erro ao configurar tabelas no MySQL: {e}")

if __name__ == "__main__":
    inicializar_banco()
