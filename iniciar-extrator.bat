@echo off
echo Iniciando Extrator de Video Python (FastAPI)...
cd extractor
call venv\Scripts\activate
uvicorn main:app --port 8000 --reload
pause
