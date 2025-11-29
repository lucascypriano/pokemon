# Pokedex Django

Passo a passo para rodar o projeto localmente.

1. Criar e ativar o ambiente virtual com Python \<versão do Python\> (ex.: 3.12):  
   - Windows: `python -m venv venv && .\\venv\\Scripts\\activate`  
   - macOS/Linux: `python3 -m venv venv && source venv/bin/activate`
2. Instalar as dependências: `pip install -r requirements.txt`
3. Coletar os arquivos estáticos: `python manage.py collectstatic`
4. Subir o servidor de desenvolvimento: `python manage.py runserver`
