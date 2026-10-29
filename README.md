# BEM FIT Academia — site

Site institucional da **BEM FIT Academia** (Cidade Jardim, Parauapebas/PA).
Estático (HTML + CSS + JS puro), pronto para deploy na Vercel sem build.

- `index.html` — página
- `style.css` — estilos
- `script.js` — status "aberto agora", grade de aulas com "próxima aula", recomendador de plano, links de WhatsApp
- `assets/` — vídeo e fotos do salão

Para editar preços, horários ou aulas: os preços estão em `index.html` (seção `#planos`) e no objeto `PLANOS` do `script.js`; a grade de aulas está no array `AULAS` e o horário de funcionamento em `FUNC`, ambos em `script.js`.
