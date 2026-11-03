/* ==========================================================
   Corte etário matrículas – Berçário ao 5º ano
   Regra: a criança precisa ter a idade da turma completa
   até 31/03 do ano letivo.
   Para mudar regras, turmas ou cores, edite as constantes abaixo.
   ========================================================== */

const CORTE_MES = 3;            // março (31/03)
const CORTE_DIA = 31;

// Berçário: aceita quem nasceu de abril até este mês no ano anterior ao ano letivo.
// Quem nasceu depois disso ainda é muito pequeno ("NÃO").
const BERCARIO_ULTIMO_MES = 8;  // agosto

// Idade completa em 31/03 -> turma
const TURMAS = [
  { idade: 0,  nome: "Berçário" },
  { idade: 1,  nome: "Infantil 1" },
  { idade: 2,  nome: "Infantil 2" },
  { idade: 3,  nome: "Infantil 3" },
  { idade: 4,  nome: "Infantil 4" },
  { idade: 5,  nome: "Infantil 5" },
  { idade: 6,  nome: "1º ano" },
  { idade: 7,  nome: "2º ano" },
  { idade: 8,  nome: "3º ano" },
  { idade: 9,  nome: "4º ano" },
  { idade: 10, nome: "5º ano" },
];
const IDADE_MAX = TURMAS[TURMAS.length - 1].idade;

// A partir deste mês o site já abre no ano letivo seguinte (período de matrículas).
// Use 13 para abrir sempre no ano atual.
const ABRIR_NO_PROXIMO_ANO_A_PARTIR_DO_MES = 11; // novembro

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const hoje = new Date();
const anoAtual = hoje.getFullYear();
const anoPadrao = hoje.getMonth() + 1 >= ABRIR_NO_PROXIMO_ANO_A_PARTIR_DO_MES ? anoAtual + 1 : anoAtual;
let anoSelecionado = anoPadrao;

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const dataCorte = `${pad(CORTE_DIA)}/${pad(CORTE_MES)}`;

/* ---------- Regras ---------- */

/* Idade completa em 31/03 do ano letivo, para quem nasceu no mês m do ano y */
function idadeNoCorte(anoLetivo, y, m, d = 1) {
  let idade = anoLetivo - y;
  const depois = m > CORTE_MES || (m === CORTE_MES && d > CORTE_DIA);
  return depois ? idade - 1 : idade;
}

/* Turma de quem nasceu no mês m do ano y (null = não atendido) */
function turmaDe(anoLetivo, y, m, d = 1) {
  const idade = idadeNoCorte(anoLetivo, y, m, d);
  if (idade < 0 || idade > IDADE_MAX) return null;
  if (idade === 0) {
    const ok = y === anoLetivo - 1 && m > CORTE_MES && m <= BERCARIO_ULTIMO_MES;
    return ok ? TURMAS[0] : null;
  }
  return TURMAS.find((t) => t.idade === idade) || null;
}

/* Anos de nascimento exibidos: do ano anterior ao letivo até o da última turma */
function anosNascimento(anoLetivo) {
  const lista = [];
  for (let y = anoLetivo - 1; y >= anoLetivo - IDADE_MAX - 1; y--) lista.push(y);
  return lista;
}

/* ---------- Renderização ---------- */

function renderTopo() {
  $("titulo").textContent = `Corte etário matrículas – ${anoSelecionado}`;
  $("regra").textContent =
    `Para o ano letivo ${anoSelecionado}, a criança entra na turma da idade que completa até ${dataCorte}/${anoSelecionado}.`;
  document.title = `Corte etário matrículas ${anoSelecionado}`;
}

function renderAnos() {
  const dif = anoSelecionado - anoAtual;
  $("anoTitulo").textContent = anoSelecionado;
  $("anoLegenda").textContent =
    dif === 0 ? "ano letivo atual" :
    dif === 1 ? "próximo ano letivo" :
    dif === -1 ? "ano letivo anterior" :
    dif > 0 ? `daqui a ${dif} anos` : `há ${-dif} anos`;

  const voltar = $("voltar");
  voltar.hidden = anoSelecionado === anoPadrao;
  voltar.textContent = `Voltar a ${anoPadrao}`;
}

function renderTabela() {
  const anos = anosNascimento(anoSelecionado);
  let html = `<colgroup><col class="c-mes">${anos.map(() => "<col>").join("")}</colgroup>`;

  html += `<thead><tr><th class="canto" rowspan="2" scope="col">Mês de<br>nascimento</th>` +
          `<th colspan="${anos.length}" scope="colgroup">Ano de nascimento</th></tr><tr>` +
          anos.map((y) => `<th scope="col">${y}</th>`).join("") + `</tr></thead><tbody>`;

  MESES.forEach((nomeMes, i) => {
    const m = i + 1;
    html += `<tr${m === CORTE_MES + 1 ? ' class="pos-corte"' : ""}><th scope="row">${nomeMes}</th>`;
    for (const y of anos) {
      const turma = turmaDe(anoSelecionado, y, m);
      if (turma) {
        html += `<td class="t${turma.idade}">${turma.nome}</td>`;
      } else {
        html += `<td class="nao">Não</td>`;
      }
    }
    html += "</tr>";
  });

  $("tabela").innerHTML = html + "</tbody>";
}

function renderLegenda() {
  $("legenda").innerHTML = TURMAS
    .map((t) => `<li><i style="background:var(--t${t.idade})"></i>${t.nome}</li>`)
    .join("") + `<li><i style="background:var(--nao)"></i>Não atendido</li>`;

  $("nota").textContent =
    `Leia assim: encontre o mês e o ano de nascimento da criança e veja a turma em ${anoSelecionado}. ` +
    `A linha mais grossa entre março e abril marca a data de corte (${dataCorte}). ` +
    `Berçário: nascidos de abril a ${MESES[BERCARIO_ULTIMO_MES - 1].toLowerCase()} de ${anoSelecionado - 1}.`;
}

function renderTudo() {
  renderTopo();
  renderAnos();
  renderLegenda();
  renderTabela();
}

/* ---------- Eventos ---------- */

function mudarAno(delta) {
  anoSelecionado += delta;
  renderTudo();
}

$("anterior").addEventListener("click", () => mudarAno(-1));
$("proximo").addEventListener("click", () => mudarAno(1));
$("voltar").addEventListener("click", () => { anoSelecionado = anoPadrao; renderTudo(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") mudarAno(-1);
  if (e.key === "ArrowRight") mudarAno(1);
});

renderTudo();
