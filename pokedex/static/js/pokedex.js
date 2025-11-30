/* ========= ELEMENTOS DO DOM ========= */

const gridEl = document.getElementById("grid");
const mensagemEl = document.getElementById("message");
const botaoAnterior = document.getElementById("prev-page");
const botaoProximo = document.getElementById("next-page");
const paginacaoEl = document.getElementById("page-numbers");
const formularioBusca = document.getElementById("search-form");
const campoBusca = document.getElementById("search-input");
const botaoFiltro = document.getElementById("filter-button");
const filtrosEl = document.getElementById("filters");
const listaTiposEl = document.getElementById("type-list");
const navHome = document.getElementById("nav-home");
const navPokedex = document.getElementById("nav-pokedex");

/* ========= ESTADO ========= */

const LIMITE = 18; // 6x3 cards por página
let paginaAtual = 1;
let totalPaginas = 1;
let emBusca = false;

// filtro de tipo
let filtroTipoAtual = "";          // "" = sem filtro
let usandoFiltroTipo = false;      // true quando estamos na listagem por tipo
const cachePokemonsPorTipo = {};   // { tipo: { lista: [], detalhes: { [url]: poke } } }
let listaPokemonsCache = [];       // lista completa (nome+url) cacheada na inicializacao
let filtrosVisiveis = false;       // controla drop-down de filtros

/* ========= TIPOS / ÍCONES / CORES ========= */

const TIPOS_PT = {
  grass: "Planta",
  fire: "Fogo",
  water: "Água",
  bug: "Inseto",
  normal: "Normal",
  poison: "Veneno",
  electric: "Elétrico",
  ground: "Terra",
  fairy: "Fada",
  fighting: "Lutador",
  psychic: "Psíquico",
  rock: "Pedra",
  ghost: "Fantasma",
  ice: "Gelo",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  flying: "Voador"
};

const ICONES_TIPOS = {
  normal:   "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg",
  fire:     "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg",
  water:    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg",
  electric: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg",
  grass:    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg",
  ice:      "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg",
  fighting: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg",
  poison:   "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg",
  ground:   "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg",
  flying:   "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg",
  psychic:  "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg",
  bug:      "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg",
  rock:     "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg",
  ghost:    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg",
  dragon:   "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg",
  dark:     "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg",
  steel:    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg",
  fairy:    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg"
};

const CORES_TIPOS  = {
  normal:   "#d9d5c9",
  fire:     "#f51717ff",
  water:    "#0478f3ff",
  electric: "#f1de03ff",
  grass:    "#00ff11ff",
  ice:      "#def1f5ff",
  fighting: "#8b5d4dff",
  poison:   "#ffa600ff",
  ground:   "#635642ff",
  flying:   "#8b99b8ff",
  psychic:  "#f082c8ff",
  bug:      "#87dd0eff",
  rock:     "#555450ff",
  ghost:    "#dccff8ff",
  dragon:   "#6f80c5ff",
  dark:     "#977b7bff",
  steel:    "#8f9296ff",
  fairy:    "#e43ae4ff"
};

/* ========= MAPA DE TIPOS EM PT → EN (BUSCA) ========= */
/* permite digitar "água", "agua", "fogo", "elétrico", etc */
const TIPOS_BUSCA_PT = {
  "agua": "water",
  "água": "water",
  "fogo": "fire",
  "planta": "grass",
  "grama": "grass",
  "elétrico": "electric",
  "eletrico": "electric",
  "normal": "normal",
  "inseto": "bug",
  "lutador": "fighting",
  "veneno": "poison",
  "terra": "ground",
  "fada": "fairy",
  "psíquico": "psychic",
  "psiquico": "psychic",
  "pedra": "rock",
  "fantasma": "ghost",
  "gelo": "ice",
  "dragão": "dragon",
  "dragao": "dragon",
  "sombrio": "dark",
  "aço": "steel",
  "aco": "steel",
  "voador": "flying"
};

/* ========= UTILS ========= */

function definirMensagem(texto) {
  mensagemEl.style.display = texto ? "block" : "none";
  mensagemEl.textContent = texto || "";
}

function limparGrid() {
  gridEl.innerHTML = "";
}

function formatarIdPokemon(id) {
  return "#" + String(id).padStart(4, "0");
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function debounce(fn, delay = 400) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function definirVisibilidadeFiltros(visivel) {
  if (!filtrosEl) return;
  filtrosEl.style.display = visivel ? "block" : "none";
  filtrosVisiveis = visivel;
}

// checa se um pokémon passa num filtro de tipo atual (pra busca por nome)
function passaNoFiltroTipo(pokemon) {
  if (!filtroTipoAtual) return true;
  return pokemon.types.some(t => t.type.name === filtroTipoAtual);
}

/* ========= LISTA DE TIPOS (FILTROS) ========= */

function criarListaTipos() {
  if (!listaTiposEl) return;

  listaTiposEl.innerHTML = "";

  // "Todos"
  const liTodos = document.createElement("li");
  liTodos.dataset.type = "";
  liTodos.style.backgroundColor = "#e5e7eb";
  liTodos.innerHTML = `
    <img src="${ICONES_TIPOS.normal}" alt="Todos" />
    <span>Todos</span>
  `;
  liTodos.classList.add("active");
  listaTiposEl.appendChild(liTodos);

  // Demais tipos
  Object.entries(TIPOS_PT).forEach(([tipoEn, rotuloPt]) => {
    const li = document.createElement("li");
    li.dataset.type = tipoEn;
    li.style.backgroundColor = CORES_TIPOS[tipoEn] || "#e5e7eb";

    const icone = ICONES_TIPOS[tipoEn] || ICONES_TIPOS.normal;

    li.innerHTML = `
      <img src="${icone}" alt="${rotuloPt}">
      <span>${rotuloPt}</span>
    `;
    listaTiposEl.appendChild(li);
  });

  // Clique num tipo
  listaTiposEl.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    [...listaTiposEl.querySelectorAll("li")].forEach(item =>
      item.classList.remove("active")
    );
    li.classList.add("active");

    filtroTipoAtual = li.dataset.type || "";
    paginaAtual = 1;
    emBusca = false;

    if (!filtroTipoAtual) {
      // volta para lista normal
      usandoFiltroTipo = false;
      carregarListaPokemons(paginaAtual);
    } else {
      // carrega lista específica daquele tipo
      carregarListaPorTipo(filtroTipoAtual, paginaAtual);
    }
  });
}

/* ========= CARD DO POKÉMON ========= */

function criarCardPokemon(pokemon) {
  const tipos = pokemon.types.map(t => t.type.name);

  const tiposHtml = tipos.map(tipoEn => {
    const label = TIPOS_PT[tipoEn] || capitalizar(tipoEn);
    const cor = CORES_TIPOS[tipoEn] || "#e5e7eb";
    return `<span class="type-pill" style="background:${cor};">${label}</span>`;
  }).join("");

  const imagem =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    "";

  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <div class="card-top-info">
      <div class="card-types-top">
        ${tiposHtml}
      </div>
      <span class="card-id">${formatarIdPokemon(pokemon.id)}</span>
    </div>
    <div class="card-image-wrapper">
      <img src="${imagem}" alt="${pokemon.name}" />
    </div>
    <h2 class="card-title">${capitalizar(pokemon.name)}</h2>
  `;

  return card;
}

/* ========= PAGINAÇÃO ========= */

function atualizarPaginacao(desativar = false) {
  paginacaoEl.innerHTML = "";

  if (desativar) {
    botaoAnterior.disabled = true;
    botaoProximo.disabled = true;
    return;
  }

  // controla apenas habilitar/desabilitar os botões Anterior/Próximo
  botaoAnterior.disabled = paginaAtual === 1;
  botaoProximo.disabled = paginaAtual === totalPaginas;

  // se só existir uma página, não precisamos renderizar números no centro
  if (totalPaginas <= 1) {
    return;
  }

  const paginas = [];

  // Caso esteja na primeira página → mostra 1, 2 e 3 (se existirem)
  if (paginaAtual === 1) {
    paginas.push(1); // página atual

    if (totalPaginas >= 2) {
      paginas.push(2);
    }
    if (totalPaginas >= 3) {
      paginas.push(3);
    }
  } else {
    // Demais casos → página anterior, atual e próxima
    if (paginaAtual > 1) {
      paginas.push(paginaAtual - 1);
    }

    paginas.push(paginaAtual);

    if (paginaAtual < totalPaginas) {
      paginas.push(paginaAtual + 1);
    }
  }

  paginas.forEach((numero) => {
    const span = document.createElement("span");
    span.textContent = numero;
    span.classList.add("page-number");
    if (numero === paginaAtual) {
      span.classList.add("active");
    }
    paginacaoEl.appendChild(span);
  });
}

  botaoAnterior.disabled = paginaAtual === 1;
  botaoProximo.disabled = paginaAtual === totalPaginas;

  const span = document.createElement("span");
  span.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  paginacaoEl.appendChild(span);


/* ========= LISTAGEM GERAL (SEM FILTRO DE TIPO) ========= */

async function carregarListaPokemons(pagina = 1) {
  const offset = (pagina - 1) * LIMITE;
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${LIMITE}&offset=${offset}`;

  definirMensagem("Carregando pokémons...");
  limparGrid();

  const resposta = await fetch(url);
  const dados = await resposta.json();

  totalPaginas = Math.ceil(dados.count / LIMITE);

  const detalhes = dados.results.map(p =>
    fetch(p.url).then(r => r.json())
  );

  const pokemons = await Promise.all(detalhes);

  limparGrid();
  definirMensagem("");

  pokemons.forEach(p => gridEl.appendChild(criarCardPokemon(p)));

  usandoFiltroTipo = false;
  paginaAtual = pagina;
  atualizarPaginacao(false);
}

/* ========= LISTAGEM POR TIPO ========= */

async function carregarListaPorTipo(tipo, pagina = 1) {
  if (!tipo) {
    return carregarListaPokemons(1);
  }

  definirMensagem("Carregando pokemons do tipo " + (TIPOS_PT[tipo] || tipo) + "...");
  limparGrid();

  // Busca lista completa daquele tipo (cache)
  if (!cachePokemonsPorTipo[tipo]) {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
    const dados = await res.json();

    cachePokemonsPorTipo[tipo] = {
      lista: dados.pokemon.map(p => p.pokemon),
      detalhes: {}
    };
  }

  const { lista, detalhes } = cachePokemonsPorTipo[tipo];
  totalPaginas = Math.ceil(lista.length / LIMITE);

  const offset = (pagina - 1) * LIMITE;
  const slice = lista.slice(offset, offset + LIMITE);

  if (!slice.length) {
    limparGrid();
    definirMensagem("Nenhum pokemon encontrado para esse tipo.");
    usandoFiltroTipo = true;
    paginaAtual = pagina;
    atualizarPaginacao(false);
    return;
  }

  const pokemons = await Promise.all(
    slice.map(async (p) => {
      if (detalhes[p.url]) return detalhes[p.url];
      const res = await fetch(p.url);
      const data = await res.json();
      detalhes[p.url] = data;
      return data;
    })
  );

  limparGrid();
  definirMensagem("");

  pokemons.forEach(p => gridEl.appendChild(criarCardPokemon(p)));

  usandoFiltroTipo = true;
  paginaAtual = pagina;
  atualizarPaginacao(false);
}

/* ========= BUSCA POR NOME OU TIPO EM PORTUGUÊS ========= */

async function buscarPokemonPorNomeOuTipo(entrada) {
  const termo = entrada.trim().toLowerCase();

  if (!termo) {
    emBusca = false;
    if (filtroTipoAtual) {
      return carregarListaPorTipo(filtroTipoAtual, 1);
    }
    return carregarListaPokemons(1);
  }

  // 1) Verifica se ? um tipo em portugu?s
  const tipoEn = TIPOS_BUSCA_PT[termo];
  if (tipoEn) {
    filtroTipoAtual = tipoEn;
    emBusca = false;
    paginaAtual = 1;

    // marca o filtro na lista (se existir)
    if (listaTiposEl) {
      [...listaTiposEl.querySelectorAll("li")].forEach(li =>
        li.classList.remove("active")
      );
      const alvo = listaTiposEl.querySelector(`li[data-type="${tipoEn}"]`);
      if (alvo) alvo.classList.add("active");
    }

    return carregarListaPorTipo(tipoEn, 1);
  }

    // tenta usar cache local de nomes (listaPokemonsCache) para busca parcial
  if (listaPokemonsCache.length) {
    const encontrados = listaPokemonsCache
      .filter(p => p.name.includes(termo))
      .slice(0, LIMITE);

    if (encontrados.length) {
      definirMensagem("Buscando pokemon...");
      limparGrid();

      try {
        const detalhes = await Promise.all(
          encontrados.map(async (p) => {
            const res = await fetch(p.url);
            if (!res.ok) return null;
            return res.json();
          })
        );

        const filtrados = detalhes.filter(Boolean).filter(poke => passaNoFiltroTipo(poke));

        if (!filtrados.length) {
          definirMensagem("Nenhum Pokemon encontrado para esse filtro.");
          emBusca = true;
          atualizarPaginacao(true);
          return;
        }

        filtrados.forEach(p => gridEl.appendChild(criarCardPokemon(p)));
        emBusca = true;
        atualizarPaginacao(true);
        definirMensagem("");
        return;
      } catch (e) {
        // se falhar, cai no fallback
      }
    }
  }

  // fallback: consulta direta na API
  definirMensagem("Buscando pokemon...");
  limparGrid();

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(termo)}`);
    if (!res.ok) {
      definirMensagem("Nenhum Pokemon encontrado.");
      atualizarPaginacao(true);
      return;
    }

    const poke = await res.json();
    limparGrid();
    definirMensagem("");

    // Se ha filtro de tipo ativo, respeita
    if (!passaNoFiltroTipo(poke)) {
      definirMensagem("Nenhum Pokemon encontrado para esse filtro.");
      emBusca = true;
      atualizarPaginacao(true);
      return;
    }

    gridEl.appendChild(criarCardPokemon(poke));
    emBusca = true;
    atualizarPaginacao(true);

  } catch (e) {
    definirMensagem("Erro na busca.");
    atualizarPaginacao(true);
  }
}

/* ========= EVENTOS ========= */

botaoAnterior.onclick = () => {
  if (paginaAtual <= 1 || emBusca) return;

  const novaPagina = paginaAtual - 1;
  if (usandoFiltroTipo && filtroTipoAtual) {
    carregarListaPorTipo(filtroTipoAtual, novaPagina);
  } else {
    carregarListaPokemons(novaPagina);
  }
};

botaoProximo.onclick = () => {
  if (paginaAtual >= totalPaginas || emBusca) return;

  const novaPagina = paginaAtual + 1;
  if (usandoFiltroTipo && filtroTipoAtual) {
    carregarListaPorTipo(filtroTipoAtual, novaPagina);
  } else {
    carregarListaPokemons(novaPagina);
  }
};

if (navHome && navPokedex) {
  navHome.addEventListener("click", (e) => {
    e.preventDefault();
    navHome.classList.add("active");
    navPokedex.classList.remove("active");

    definirVisibilidadeFiltros(false);

    emBusca = false;
    filtroTipoAtual = "";
    usandoFiltroTipo = false;
    paginaAtual = 1;

    carregarListaPokemons(1);
  });

  navPokedex.addEventListener("click", (e) => {
    e.preventDefault();
    navPokedex.classList.add("active");
    navHome.classList.remove("active");

    definirVisibilidadeFiltros(true);
  });

}


if (botaoFiltro) {
  botaoFiltro.addEventListener("click", () => {
    definirVisibilidadeFiltros(!filtrosVisiveis);
  });
}

formularioBusca.addEventListener("submit", e => e.preventDefault());

const buscaDinamica = debounce(valor => {
  buscarPokemonPorNomeOuTipo(valor);
}, 400);

if (campoBusca) {
  campoBusca.addEventListener("input", e => {
    buscaDinamica(e.target.value);
  });
}

async function carregarListaCompletaCache() {
  try {
    const res = await fetch("/api/pokemon-names/");
    if (res.ok) {
      listaPokemonsCache = await res.json();
    }
  } catch (e) {
    // se falhar, segue sem cache
  }
}

criarListaTipos();
carregarListaCompletaCache();
carregarListaPokemons(1);
