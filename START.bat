@echo off
chcp 65001 >nul
title موسوعة حساب التفاضل والتكامل
echo.
echo  ╔════════════════════════════════════════╗
echo  ║  موسوعة حساب التفاضل والتكامل        ║
echo  ╚════════════════════════════════════════╝
echo.
echo  جاري التشغيل...
echo.
echo  🌐 الموقع: http://localhost:3000
echo.
echo  ⚠️  لا تغلق هذه النافذة!
echo  ⚠️  لإيقاف السيرفر اضغط Ctrl+C
echo.
start http://localhost:3000
call npm run dev
