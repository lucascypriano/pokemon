from django.db import models


class PokemonCache(models.Model):
  name = models.CharField(max_length=100, unique=True)
  data = models.JSONField()
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:  # pragma: no cover
    return self.name


class PokemonListCache(models.Model):
  """Cache para a lista completa de pokemons (nome + url)."""

  data = models.JSONField()
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:  # pragma: no cover
    return f"List cache ({self.updated_at})"


class PokemonNamesCache(models.Model):
  data = models.JSONField()
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:  # pragma: no cover
    return f"Names cache ({self.updated_at})"
