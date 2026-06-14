1. Começamos a rodar isso no terminal para instalar as depêndencias:
    python -m pip install fastapi uvicorn mysql-connector-python

Ligar o Backend: Vá no terminal da pasta /backend e rode:
bash
python -m uvicorn main:app --reload --port 8001
Ligar o Frontend: Vá no terminal da pasta /frontend e rode:
bash
npm run dev
Acesse http://localhost:5173 (ou a porta informada pelo Vite) no seu navegador, crie um atleta, abra uma sessão de treino, clique em Simular Clique cerca de 15 vezes, feche a sessão e vá até a aba Análise para ver o gráfico e as estatísticas do Pandas em ação!