# Pokedex Django

Passo a passo para rodar o projeto localmente.

1. Criar e ambiente virtual com Python 3.12:  
   - Windows: `python -m venv venv`  
   - macOS/Linux: `python3 -m venv venv`
2. Ativar o ambiente virtual com Python 3.12
   - Windows: `.\venv\Scripts\activate`  
   - macOS/Linux: `source venv/bin/activate`
3. Instalar as dependencias: `pip install -r requirements.txt`
4. Gerar as migrations: `python manage.py makemigrations`
5. Aplicar as migrations: `python manage.py migrate`
6. Coletar os arquivos estaticos: `python manage.py collectstatic`
7. Subir o servidor de desenvolvimento: `python manage.py runserver`
