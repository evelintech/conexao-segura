/* ===== Tamanho da letra (botões A− / A+) ===== */
const ESCALAS = [0.9, 1, 1.15, 1.3, 1.5];
let nivel = 1;

try {
  const salvo = localStorage.getItem("escala-letra");
  if (salvo !== null && ESCALAS[Number(salvo)]) nivel = Number(salvo);
} catch (e) {
  // navegador sem localStorage: segue com o tamanho padrão
}

function aplicarEscala() {
  document.documentElement.style.setProperty("--escala", ESCALAS[nivel]);
  try {
    localStorage.setItem("escala-letra", String(nivel));
  } catch (e) {}
}

document.querySelectorAll("[data-fonte]").forEach((botao) => {
  botao.addEventListener("click", () => {
    const passo = Number(botao.dataset.fonte);
    nivel = Math.min(ESCALAS.length - 1, Math.max(0, nivel + passo));
    aplicarEscala();
  });
});

aplicarEscala();

/* ===== Abrir o tutorial quando alguém clica num link para ele ===== */
document.querySelectorAll('a[href^="#tutorial-"]').forEach((link) => {
  link.addEventListener("click", () => {
    const alvo = document.querySelector(link.getAttribute("href"));
    if (alvo) alvo.open = true;
  });
});

/* ===== Quiz ===== */
const PERGUNTAS = [
  {
    pergunta: "Um número novo diz ser seu neto e pede um Pix urgente. O que fazer?",
    opcoes: ["Fazer o Pix rápido para ajudar", "Ligar para o número antigo do neto", "Pedir o CPF dele"],
    certa: 1,
    explicacao: "Golpistas fingem ser parentes. Sempre confirme pelo número que você já conhece ou por chamada de vídeo.",
  },
  {
    pergunta: "O “banco” liga dizendo que sua conta foi invadida e pede sua senha. O que fazer?",
    opcoes: ["Passar a senha para resolver logo", "Desligar e ligar eu mesmo para o número atrás do cartão"],
    certa: 1,
    explicacao: "Banco nunca pede senha, código ou transferência por telefone.",
  },
  {
    pergunta: "Chegou um código de 6 números por SMS e alguém pede para você passar. O que fazer?",
    opcoes: ["Passar, se a pessoa for educada", "Nunca passar o código"],
    certa: 1,
    explicacao: "Com esse código, o golpista pode tomar o seu WhatsApp.",
  },
  {
    pergunta: "Uma mensagem diz: “Seus pontos vencem hoje, clique aqui”. O que fazer?",
    opcoes: ["Clicar para não perder os pontos", "Não clicar e conferir no aplicativo oficial"],
    certa: 1,
    explicacao: "Links em mensagens com pressa costumam levar a sites falsos.",
  },
  {
    pergunta: "Um motoboy chega dizendo que veio buscar seu cartão a pedido do banco. Pode entregar?",
    opcoes: ["Sim, se ele estiver de uniforme", "Não. Banco não busca cartão em casa"],
    certa: 1,
    explicacao: "Nenhum banco manda buscar cartão na casa do cliente.",
  },
  {
    pergunta: "Ofereceram um empréstimo ótimo, mas pedem uma taxa antes de liberar. É confiável?",
    opcoes: ["Sim, é normal pagar antes", "Não. Empréstimo de verdade não cobra taxa antecipada"],
    certa: 1,
    explicacao: "Cobrança antes de liberar dinheiro é sinal de golpe.",
  },
  {
    pergunta: "Você fez um Pix para um golpista. Qual o primeiro passo?",
    opcoes: ["Esperar alguns dias para ver", "Contestar o Pix no aplicativo e avisar o banco na hora"],
    certa: 1,
    explicacao: "Quanto antes você contestar, maior a chance de o dinheiro ser bloqueado e devolvido.",
  },
  {
    pergunta: "Qual destas é uma boa proteção para o WhatsApp?",
    opcoes: ["Usar a mesma senha para tudo", "Ativar a confirmação em duas etapas"],
    certa: 1,
    explicacao: "Com a confirmação em duas etapas, ninguém entra no seu WhatsApp só com o código do SMS.",
  },
];

const caixa = document.getElementById("quiz-caixa");
let atual = 0;
let acertos = 0;

function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto) el.textContent = texto;
  return el;
}

function mostrarPergunta() {
  const q = PERGUNTAS[atual];
  caixa.replaceChildren();

  caixa.append(criar("p", "quiz-progresso", `Pergunta ${atual + 1} de ${PERGUNTAS.length}`));
  const titulo = criar("p", "quiz-pergunta", q.pergunta);
  titulo.tabIndex = -1;
  caixa.append(titulo);

  const opcoes = criar("div", "quiz-opcoes");
  // embaralha as opções para a resposta certa não ficar sempre no mesmo lugar
  const ordem = q.opcoes.map((_, i) => i).sort(() => Math.random() - 0.5);
  ordem.forEach((i) => {
    const botao = criar("button", "", q.opcoes[i]);
    botao.type = "button";
    botao.dataset.indice = i;
    botao.addEventListener("click", () => responder(i, opcoes));
    opcoes.append(botao);
  });
  caixa.append(opcoes);

  if (atual > 0) titulo.focus();
}

function responder(escolha, opcoes) {
  const q = PERGUNTAS[atual];
  const botoes = opcoes.querySelectorAll("button");
  const acertou = escolha === q.certa;
  if (acertou) acertos++;

  botoes.forEach((b) => {
    const i = Number(b.dataset.indice);
    b.disabled = true;
    if (i === q.certa) {
      b.classList.add("certa");
      b.textContent = "✅ " + b.textContent;
    } else if (i === escolha) {
      b.classList.add("errada");
      b.textContent = "❌ " + b.textContent;
    }
  });

  const retorno = criar("div", "quiz-retorno");
  retorno.append(criar("strong", "", acertou ? "Muito bem, você acertou!" : "Quase! A resposta certa está em verde."));
  retorno.append(criar("span", "", q.explicacao));
  caixa.append(retorno);

  const ultima = atual === PERGUNTAS.length - 1;
  const proximo = criar("button", "quiz-botao", ultima ? "Ver meu resultado" : "Próxima pergunta →");
  proximo.type = "button";
  proximo.style.marginTop = "1rem";
  proximo.addEventListener("click", () => {
    atual++;
    if (ultima) mostrarResultado();
    else mostrarPergunta();
  });
  caixa.append(proximo);
  proximo.focus();
}

function mostrarResultado() {
  caixa.replaceChildren();
  const total = PERGUNTAS.length;
  let mensagem;
  if (acertos === total) mensagem = "Perfeito! Você está pronto para se proteger dos golpistas.";
  else if (acertos >= total - 2) mensagem = "Muito bom! Releia as regras de ouro para ficar ainda mais seguro.";
  else mensagem = "Vale a pena rever os golpes comuns e as regras de ouro. Tente de novo!";

  const titulo = criar("p", "quiz-resultado", `Você acertou ${acertos} de ${total}.`);
  titulo.tabIndex = -1;
  caixa.append(titulo, criar("p", "", mensagem));

  const denovo = criar("button", "quiz-botao", "Fazer o teste de novo");
  denovo.type = "button";
  denovo.addEventListener("click", () => {
    atual = 0;
    acertos = 0;
    mostrarPergunta();
  });
  caixa.append(denovo);
  titulo.focus();
}

mostrarPergunta();
