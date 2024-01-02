for /f "tokens=1 delims=." %%a in ('dir /B *.png') do ffmpeg -i "%%a.png" -c:v libwebp "%%a.webp"
for /f "tokens=1 delims=." %%a in ('dir /B *.jpg') do ffmpeg -i "%%a.jpg" -c:v libwebp "%%a.webp"
del *.jpg
del *.png
