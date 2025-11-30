import json
from datetime import timedelta
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_GET

from pokedex.models import PokemonCache, PokemonNamesCache, PokemonListCache


def home(request):
    return render(request, "home.html")


# tempo de vida do cache local
CACHE_TTL = timedelta(hours=24)


def _buscar_na_pokeapi(nome: str):
    """Busca o Pokémon na API oficial e devolve (dados, status_code)."""
    url = f"https://pokeapi.co/api/v2/pokemon/{nome.lower()}"
    try:
        with urlopen(url) as resp:
            payload = resp.read().decode("utf-8")
            return json.loads(payload), resp.status
    except HTTPError as exc:
        return None, exc.code
    except URLError:
        return None, None


@require_GET
def pokemon_detail(request, nome: str):
    """Retorna dados do Pokémon usando cache em SQLite."""
    nome = (nome or "").strip().lower()
    if not nome:
        return JsonResponse({"error": "nome inválido"}, status=400)

    agora = timezone.now()
    try:
        cache = PokemonCache.objects.get(name=nome)
        if agora - cache.updated_at < CACHE_TTL:
            return JsonResponse(cache.data, safe=False)
    except PokemonCache.DoesNotExist:
        cache = None

    dados, status = _buscar_na_pokeapi(nome)
    if status == 404:
        return JsonResponse({"error": "Pokémon não encontrado"}, status=404)
    if dados is None:
        # erro de rede ou status diferente de 404
        return JsonResponse({"error": "Erro ao consultar PokeAPI"}, status=502)

    if cache:
        cache.data = dados
        cache.save(update_fields=["data", "updated_at"])
    else:
        PokemonCache.objects.create(name=nome, data=dados)

    return JsonResponse(dados, safe=False)


@require_GET
def pokemon_names(request):
  """Retorna lista de nomes de Pokémon, com cache em SQLite."""
  agora = timezone.now()
  try:
    cache = PokemonListCache.objects.latest("updated_at")
    if agora - cache.updated_at < CACHE_TTL:
      return JsonResponse(cache.data, safe=False)
  except PokemonListCache.DoesNotExist:
    cache = None

  url = "https://pokeapi.co/api/v2/pokemon?limit=1328&offset=0"
  try:
    with urlopen(url) as resp:
      payload = resp.read().decode("utf-8")
      dados = json.loads(payload)
      lista = dados.get("results", [])
  except Exception:
    return JsonResponse({"error": "Erro ao consultar PokeAPI"}, status=502)

  if cache:
    cache.data = lista
    cache.save(update_fields=["data", "updated_at"])
  else:
    PokemonListCache.objects.create(data=lista)

  return JsonResponse(lista, safe=False)
