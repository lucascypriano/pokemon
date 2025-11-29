/* ========= ELEMENTOS DO DOM ========= */

const gridEl = document.getElementById("grid");
const mensagemEl = document.getElementById("message");
const botaoAnterior = document.getElementById("prev-page");
const botaoProximo = document.getElementById("next-page");
const paginacaoEl = document.getElementById("page-numbers");
const formularioBusca = document.getElementById("search-form");
const campoBusca = document.getElementById("search-input");
const listaTiposEl = document.getElementById("type-list");

/* ========= CONFIGURAÇÕES ========= */

const LIMITE = 12;
let paginaAtual = 1;
let totalPaginas = 1;
let emBusca = false;
let filtroTipoAtual = null;

const TIPOS = [
  "normal","fire","water","grass","electric","ice","fighting",
  "poison","ground","flying","psychic","bug","rock","ghost",
  "dragon","dark","steel","fairy"
];

/* ========= ÍCONES E CORES DOS TIPOS ========= */

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
  poison:   "#0ae754ff",
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

const TIPOS_PT = {
  grass: "Planta", fire: "Fogo", water: "Água", bug: "Inseto",
  normal: "Normal", poison: "Veneno", electric: "Elétrico",
  ground: "Terra", fairy: "Fada", fighting: "Lutador",
  psychic: "Psíquico", rock: "Pedra", ghost: "Fantasma",
  ice: "Gelo", dragon: "Dragão", dark: "Sombrio",
  steel: "Aço", flying: "Voador"
};

/* ========= FUNÇÕES UTILITÁRIAS ========= */

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

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/* ========= CRIAÇÃO DO CARD ========= */

function criarCardPokemon(pokemon) {
  const tipos = pokemon.types.map(t => t.type.name);
  const img =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    "";

  // Gera HTML das tags de tipo
  const tiposHTML = tipos.map(tipo => `
    <span class="tag-tipo" style="
      background:${CORES_TIPOS[tipo]};
      border-color:${CORES_TIPOS[tipo]};
    ">
      <img src="${ICONES_TIPOS[tipo]}" alt="${tipo}">
      ${capitalizar(tipo)}
    </span>
  `).join("");

  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <div class="card-top">
      <div class="card-tipos">
        ${tiposHTML}
      </div>
      <span class="card-id">${formatarIdPokemon(pokemon.id)}</span>
    </div>

    <div class="card-img-wrap">
      <img src="${img}" alt="${pokemon.name}">
    </div>

    <div class="card-name">${capitalizar(pokemon.name)}</div>
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

  botaoAnterior.disabled = paginaAtual === 1;
  botaoProximo.disabled = paginaAtual === totalPaginas;

  const paginas = [];
  if (paginaAtual > 1) paginas.push(paginaAtual - 1);
  paginas.push(paginaAtual);
  if (paginaAtual < totalPaginas) paginas.push(paginaAtual + 1);

  paginas.forEach(num => {
    const btn = document.createElement("button");
    btn.textContent = num;
    btn.className = "page-number" + (num === paginaAtual ? " active" : "");
    btn.onclick = () => {
      paginaAtual = num;
      carregarListaPokemons(paginaAtual);
    };
    paginacaoEl.appendChild(btn);
  });
}

/* ========= LISTAGEM NORMAL ========= */

async function carregarListaPokemons(pagina = 1) {
  if (filtroTipoAtual) return;

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

  atualizarPaginacao();
}

/* ========= BUSCA DINÂMICA ========= */

async function buscarPokemonPorNome(nome) {
  filtroTipoAtual = null;

  if (!nome.trim()) {
    emBusca = false;
    return carregarListaPokemons(paginaAtual);
  }

  definirMensagem("Buscando pokémon...");
  limparGrid();

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);

    if (!res.ok) {
      definirMensagem("Nenhum Pokémon encontrado.");
      return;
    }

    const poke = await res.json();
    limparGrid();
    definirMensagem("");

    gridEl.appendChild(criarCardPokemon(poke));

    emBusca = true;
    atualizarPaginacao(true);

  } catch {
    definirMensagem("Erro na busca.");
  }
}

/* ========= FILTRO POR TIPO ========= */

async function buscarPokemonPorTipo(tipo) {
  campoBusca.value = "";
  filtroTipoAtual = tipo;
  emBusca = true;

  limparGrid();
  definirMensagem("Carregando pokémons...");

  const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
  const dados = await res.json();

  const selecionados = dados.pokemon.slice(0, 30);

  const detalhes = selecionados.map(p =>
    fetch(p.pokemon.url).then(r => r.json())
  );

  const pokemons = await Promise.all(detalhes);

  limparGrid();
  definirMensagem("");

  pokemons.forEach(p => gridEl.appendChild(criarCardPokemon(p)));

  atualizarPaginacao(true);
}

/* ========= LISTA DE TIPOS ========= */

function renderizarListaTipos() {
  TIPOS.forEach(tipo => {
    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${ICONES_TIPOS[tipo]}">
      <span>${capitalizar(tipo)}</span>
    `;

    li.style.backgroundColor = CORES_TIPOS[tipo];
    li.style.borderColor = CORES_TIPOS[tipo];

    li.onclick = () => {
      if (li.classList.contains("active")) {
        li.classList.remove("active");
        filtroTipoAtual = null;
        campoBusca.value = "";
        emBusca = false;
        carregarListaPokemons(1);
        return;
      }

      document.querySelectorAll(".type-list li")
              .forEach(e => e.classList.remove("active"));

      li.classList.add("active");
      buscarPokemonPorTipo(tipo);
    };

    listaTiposEl.appendChild(li);
  });
}

/* ========= EVENTOS ========= */

botaoAnterior.onclick = () => {
  if (paginaAtual > 1 && !emBusca) {
    paginaAtual--;
    carregarListaPokemons(paginaAtual);
  }
};

botaoProximo.onclick = () => {
  if (paginaAtual < totalPaginas && !emBusca) {
    paginaAtual++;
    carregarListaPokemons(paginaAtual);
  }
};

formularioBusca.addEventListener("submit", e => e.preventDefault());

const buscaDinamica = debounce(valor => {
  document.querySelectorAll(".type-list li")
          .forEach(i => i.classList.remove("active"));

  filtroTipoAtual = null;
  buscarPokemonPorNome(valor);

}, 400);

campoBusca.addEventListener("input", e => {
  buscaDinamica(e.target.value);
});

/* ========= INÍCIO ========= */

renderizarListaTipos();
carregarListaPokemons(1);
