@echo off
title Claw Agent - Optimized Gemma 16GB
cd /d "%~dp0"

:: Blackwell 50-series and VRAM optimizations
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_KV_CACHE_TYPE=q4_0
set CUDA_FORCE_PTX_JIT=1

:: Local API credentials
set OPENAI_BASE_URL=http://127.0.0.1:11434/v1
set OPENAI_API_KEY=local-token

echo Waking up the lobster on your 5070 Ti...
echo.

:: Launch using your new alias
claw --model openai/gemma16

pause