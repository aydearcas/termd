@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Termd requiere Node.js 20 o posterior para usar el lanzador.
  echo Instala Node.js LTS desde https://nodejs.org y vuelve a abrir este archivo.
  echo Alternativa: descarga https://aydearcas.github.io/termd/Termd.html y abrelo en tu navegador.
  pause
  exit /b 1
)
node launch.cjs
pause
