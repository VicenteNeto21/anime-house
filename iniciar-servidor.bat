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

REM Aguarda 5 segundos para dar tempo ao servidor de iniciar e abre o navegador.
REM O comando start "" /b executa em background sem abrir uma nova janela de console.
start "" /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Inicia o servidor e mostra os logs. Eles são essenciais para o desenvolvimento.
call npm run dev

pause
