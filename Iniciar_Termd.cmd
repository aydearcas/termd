@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Termd requiere Node.js 20 o posterior para usar el lanzador.
  echo Instala Node.js LTS desde https://nodejs.org y vuelve a abrir este archivo.
  echo Alternativa: abre Termd.html en tu navegador. Lee LEEME.md.
  pause
  exit /b 1
)
node launch.cjs
pause
