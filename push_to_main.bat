@echo off
chcp 65001 >nul
git checkout main
git add .
git commit -m "Update files"
git push -u origin main
echo.
echo Code pushed to main branch in https://github.com/Rudem123/fetch1.git
