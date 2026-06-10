import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """Função para abrir a conexão com o bando de dados"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='SportNeural',
            user='miguel',
            password='@MUSOYR#&EJDU@U*2'
        )
        return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None