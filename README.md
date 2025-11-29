# Pokedex Django

Passo a passo para rodar o projeto localmente.

1. Criar e ambiente virtual com Python 3.12:  
   - Windows: `python -m venv venv`  
   - macOS/Linux: `python3 -m venv venv`
2. Ativar o ambiente virtual com Python 3.12
   - Windows: `.\venv\Scripts\activate`  
   - macOS/Linux: `source venv/bin/activate`
3. Instalar as dependências: `pip install -r requirements.txt`
4. Coletar os arquivos estáticos: `python manage.py collectstatic`
5. Subir o servidor de desenvolvimento: `python manage.py runserver`
