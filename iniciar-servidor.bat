@echo off
echo ===================================
echo     Iniciando Anime House (Dev)
echo ===================================
echo.

REM Vai para o diretorio do script
cd /d "%~dp0"

REM Verifica se o node_modules existe, se nao, roda npm install
if not exist "node_modules\" (
    echo Instalando dependencias do projeto...
    call npm install
    echo.
)

echo Iniciando o servidor Next.js...
echo O navegador abrira automaticamente em instantes.
echo.
echo Pressione Ctrl+C para encerrar o servidor.
echo.

REM Aguarda 3 segundos em background e abre o navegador
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

REM Inicia o servidor (silencioso, sem logs para não pesar)
call npm run dev > nul 2>&1
