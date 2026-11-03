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

/* ---------- Exportar PDF (paisagem, download direto) ---------- */
// Gera o PDF com a biblioteca jsPDF (arquivo jspdf.umd.min.js, na mesma pasta),
// sem depender da janela de impressão. Sempre usa as cores do tema claro.

function hexParaRgb(hex) {
  const h = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function coresDoTemaClaro() {
  const raiz = document.documentElement;
  const atual = raiz.getAttribute("data-theme");
  raiz.setAttribute("data-theme", "claro");
  const cs = getComputedStyle(raiz);
  const v = (nome) => hexParaRgb(cs.getPropertyValue(nome));
  const cores = {
    faixa: v("--faixa"), faixaTinta: v("--faixa-tinta"), sombra: v("--sombra-topo"),
    cab1: v("--cab1"), cab2: v("--cab2"), cabTinta: v("--cab-tinta"),
    superficie: v("--superficie"), tinta: v("--tinta"), suave: v("--tinta-suave"),
    linha: v("--linha"), nao: v("--nao"), naoTinta: v("--nao-tinta"), celula: v("--celula-tinta"),
    turmas: TURMAS.map((t) => v(`--t${t.idade}`)),
  };
  raiz.setAttribute("data-theme", atual);
  return cores;
}

function exportarPDF() {
  if (!window.jspdf) {
    alert("Biblioteca de PDF não encontrada. Mantenha o arquivo jspdf.umd.min.js na mesma pasta do index.html.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const c = coresDoTemaClaro();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 297
  const M = 10;
  const cor = (rgb) => doc.setFillColor(...rgb);
  const txt = (rgb) => doc.setTextColor(...rgb);

  /* faixa do título */
  const topoH = 24;
  cor(c.sombra); doc.roundedRect(M, M + 1.2, W - 2 * M, topoH, 4, 4, "F");
  cor(c.faixa);  doc.roundedRect(M, M, W - 2 * M, topoH, 4, 4, "F");
  txt(c.faixaTinta);
  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text(`CORTE ETÁRIO MATRÍCULAS - ${anoSelecionado}`, W / 2, M + 11.5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const regra = doc.splitTextToSize($("regra").textContent, W - 2 * M - 20);
  doc.text(regra, W / 2, M + 18, { align: "center" });

  /* tabela */
  const anos = anosNascimento(anoSelecionado);
  const x0 = M, y0 = M + topoH + 7;
  const colMes = 32;
  const colW = (W - 2 * M - colMes) / anos.length;
  const rowH = 9, hdrH = 8;

  // cabeçalho
  cor(c.cab1); doc.rect(x0, y0, colMes, hdrH * 2, "F");
  doc.rect(x0 + colMes, y0, colW * anos.length, hdrH, "F");
  cor(c.cab2); doc.rect(x0 + colMes, y0 + hdrH, colW * anos.length, hdrH, "F");
  txt(c.cabTinta); doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("MÊS DE", x0 + 3, y0 + 6.2);
  doc.text("NASCIMENTO", x0 + 3, y0 + 11.2);
  doc.setFontSize(10);
  doc.text("ANO DE NASCIMENTO", x0 + colMes + (colW * anos.length) / 2, y0 + 5.6, { align: "center" });
  doc.setFontSize(11);
  anos.forEach((y, i) => doc.text(String(y), x0 + colMes + colW * i + colW / 2, y0 + hdrH + 5.6, { align: "center" }));

  // linhas
  const yCorpo = y0 + hdrH * 2;
  doc.setLineWidth(0.4);
  MESES.forEach((nomeMes, i) => {
    const m = i + 1;
    const y = yCorpo + rowH * i;
    cor(c.superficie); doc.rect(x0, y, colMes, rowH, "F");
    txt(c.tinta); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    doc.text(nomeMes.toUpperCase(), x0 + 3, y + 6);
    anos.forEach((ano, j) => {
      const turma = turmaDe(anoSelecionado, ano, m);
      const x = x0 + colMes + colW * j;
      cor(turma ? c.turmas[turma.idade] : c.nao);
      doc.setDrawColor(...c.superficie);
      doc.rect(x, y, colW, rowH, "FD");
      if (turma) { txt(c.celula); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); }
      else       { txt(c.naoTinta); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); }
      doc.text((turma ? turma.nome : "Não").toUpperCase(), x + colW / 2, y + 5.8, { align: "center" });
    });
  });

  // moldura e linha do corte (entre março e abril)
  const yFim = yCorpo + rowH * 12;
  doc.setDrawColor(...c.cab1);
  doc.setLineWidth(0.8);
  doc.rect(x0, y0, W - 2 * M, yFim - y0);
  doc.line(x0 + colMes, y0 + hdrH * 2, x0 + colMes, yFim);
  doc.setLineWidth(1);
  const yCorte = yCorpo + rowH * CORTE_MES;
  doc.line(x0, yCorte, W - M, yCorte);

  /* legenda */
  let lx = x0, ly = yFim + 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  const itens = TURMAS.map((t) => ({ nome: t.nome, rgb: c.turmas[t.idade] }))
    .concat([{ nome: "Não atendido", rgb: c.nao }]);
  itens.forEach((it) => {
    const w = doc.getTextWidth(it.nome) + 11;
    if (lx + w > W - M) { lx = x0; ly += 6.5; }
    cor(it.rgb); doc.setDrawColor(...c.linha); doc.setLineWidth(0.2);
    doc.circle(lx + 2.5, ly - 1, 2.2, "FD");
    txt(c.tinta); doc.text(it.nome, lx + 6.5, ly);
    lx += w + 2;
  });

  /* nota */
  txt(c.suave); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize($("nota").textContent, W - 2 * M), x0, ly + 8);

  doc.save(`corte-etario-matriculas-${anoSelecionado}.pdf`);
}

$("exportar").addEventListener("click", exportarPDF);

/* ---------- Tema (claro / médio / escuro) ---------- */

function marcarTema(tema) {
  document.querySelectorAll("[data-tema]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.tema === tema)));
}

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  marcarTema(tema);
  try { localStorage.setItem("tema", tema); } catch (e) {}
}

document.querySelectorAll("[data-tema]").forEach((b) =>
  b.addEventListener("click", () => aplicarTema(b.dataset.tema)));

// Na impressão usa sempre o tema claro (economiza tinta) e depois volta
let temaAntesDeImprimir = null;
window.addEventListener("beforeprint", () => {
  temaAntesDeImprimir = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", "claro");
});
window.addEventListener("afterprint", () => {
  if (temaAntesDeImprimir) document.documentElement.setAttribute("data-theme", temaAntesDeImprimir);
});

marcarTema(document.documentElement.getAttribute("data-theme"));
renderTudo();