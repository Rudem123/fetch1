@echo off
chcp 65001 >nul
git remote set-url origin https://github.com/Rudem123/fetch1.git
git add .
git commit -m "Initial commit to fetch1 repository"
git push -u origin lab6
echo.
echo Branch lab6 pushed to https://github.com/Rudem123/fetch1.git
