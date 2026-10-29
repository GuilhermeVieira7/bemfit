/* BEM FIT Academia — interações */
(() => {
  const WA = "5594992086764";
  const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  // ---------- links de WhatsApp ----------
  document.querySelectorAll("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // ---------- hora local de Parauapebas (America/Belem, UTC-3) ----------
  function agoraPA() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Belem", weekday: "short", hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const h = Number(get("hour")) % 24;
    return { dia: wd, min: h * 60 + Number(get("minute")) };
  }

  // ---------- horários de funcionamento ----------
  const FUNC = {
    0: [[8 * 60, 12 * 60]],
    1: [[5 * 60, 23 * 60]], 2: [[5 * 60, 23 * 60]], 3: [[5 * 60, 23 * 60]], 4: [[5 * 60, 23 * 60]], 5: [[5 * 60, 23 * 60]],
    6: [[8 * 60, 12 * 60], [16 * 60, 20 * 60]],
  };
  const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hhmm = (m) => {
    const h = Math.floor(m / 60), mm = m % 60;
    return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
  };

  function status() {
    const el = document.getElementById("status");
    if (!el) return;
    const { dia, min } = agoraPA();
    const aberto = FUNC[dia].find(([a, f]) => min >= a && min < f);
    if (aberto) {
      el.className = "status is-open";
      el.querySelector("b").textContent = `Aberto agora · até ${hhmm(aberto[1])}`;
      return;
    }
    // próxima abertura
    for (let i = 0; i < 8; i++) {
      const d = (dia + i) % 7;
      const slot = FUNC[d].find(([a]) => i > 0 || a > min);
      if (slot) {
        const quando = i === 0 ? "hoje" : i === 1 ? "amanhã" : DIAS[d].toLowerCase();
        el.className = "status is-closed";
        el.querySelector("b").textContent = `Fechado · abre ${quando} às ${hhmm(slot[0])}`;
        return;
      }
    }
  }

  // destaca o dia de hoje na tabela de horários
  function hojeTabela() {
    const { dia } = agoraPA();
    document.querySelectorAll("#hours tr[data-d]").forEach((tr) => {
      tr.classList.toggle("today", tr.dataset.d.split(",").map(Number).includes(dia));
    });
  }

  // ---------- grade de aulas ----------
  const AULAS = [
    { n: "Corrida de rua", t: 5 * 60 + 30, d: [2, 4, 6] },
    { n: "Pilates", t: 6 * 60, d: [2, 4] },
    { n: "Pilates", t: 17 * 60, d: [1, 3, 5] },
    { n: "Zumba", t: 18 * 60, d: [1, 3] },
    { n: "Funcional", t: 19 * 60, d: [1, 3, 5] },
    { n: "FitDance", t: 19 * 60, d: [2, 4] },
  ];
  const ORDEM = [1, 2, 3, 4, 5, 6, 0]; // Seg → Dom

  function proxima() {
    const { dia, min } = agoraPA();
    for (let i = 0; i < 8; i++) {
      const d = (dia + i) % 7;
      const lista = AULAS.filter((a) => a.d.includes(d) && (i > 0 || a.t > min)).sort((a, b) => a.t - b.t);
      if (lista.length) return { ...lista[0], dia: d, emDias: i, faltam: i === 0 ? lista[0].t - min : null };
    }
  }

  function renderGrade() {
    const board = document.getElementById("board");
    const tabs = document.getElementById("days");
    if (!board) return;
    const { dia, min } = agoraPA();
    const nx = proxima();
    board.innerHTML = "";
    tabs.innerHTML = "";

    ORDEM.forEach((d) => {
      const col = document.createElement("div");
      col.className = "col" + (d === dia ? " today show" : "");
      col.dataset.d = d;
      const aulas = AULAS.filter((a) => a.d.includes(d)).sort((a, b) => a.t - b.t);
      col.innerHTML = `<div class="col__h"><span>${CURTO[d]}</span>${d === dia ? "<span>hoje</span>" : ""}</div>
        <div class="col__body">${
          aulas.length
            ? aulas.map((a) => {
                const past = d === dia && a.t <= min;
                const isNext = nx && nx.dia === d && nx.t === a.t && nx.n === a.n;
                return `<div class="cls${past ? " past" : ""}${isNext ? " is-next" : ""}"><span class="cls__t">${hhmm(a.t)}</span><span class="cls__n">${a.n}</span></div>`;
              }).join("")
            : `<p class="col__empty">Sem aulas coletivas.<br>Musculação liberada no horário de funcionamento.</p>`
        }</div>`;
      board.appendChild(col);

      const b = document.createElement("button");
      b.role = "tab";
      b.textContent = d === dia ? `${CURTO[d]} · hoje` : CURTO[d];
      b.setAttribute("aria-selected", d === dia);
      b.addEventListener("click", () => {
        tabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
        board.querySelectorAll(".col").forEach((c) => c.classList.toggle("show", Number(c.dataset.d) === d));
      });
      tabs.appendChild(b);
    });

    const box = document.getElementById("next");
    if (nx && box) {
      box.querySelector(".next__name").textContent = nx.n;
      let quando;
      if (nx.emDias === 0) {
        const f = nx.faltam;
        quando = f < 60 ? `Hoje às ${hhmm(nx.t)} · começa em ${f} min` : `Hoje às ${hhmm(nx.t)} · em ${Math.floor(f / 60)}h${f % 60 ? String(f % 60).padStart(2, "0") : ""}`;
      } else if (nx.emDias === 1) quando = `Amanhã às ${hhmm(nx.t)}`;
      else quando = `${DIAS[nx.dia]} às ${hhmm(nx.t)}`;
      box.querySelector(".next__when").textContent = quando;
    }
  }

  // ---------- encontre seu plano ----------
  const resp = { freq: "livre", fam: "nao", fid: "nao" };
  const PLANOS = {
    "3x": { nome: "Plano 3x na Semana", preco: "R$ 100,00/mês", why: "O mais em conta pra quem treina três dias por semana.", hl: ["3x"] },
    anual: { nome: "Plano Livre Anual", preco: "R$ 109,99/mês", why: "A menor mensalidade da casa. Recorrente no cartão, sem ocupar o limite.", hl: ["anual"] },
    familia: { nome: "Plano Família", preco: "R$ 114,99 por pessoa", why: "Sem fidelidade, a partir de 2 membros da família fechando juntos.", hl: ["familia"] },
    mensal: { nome: "Plano Livre Mensal", preco: "R$ 119,99/mês", why: "Sem fidelidade. Se puder pagar à vista, o Trimestral sai R$ 115/mês.", hl: ["mensal", "trimestral"] },
  };
  function recomendar() {
    let k;
    if (resp.freq === "3x") k = "3x";
    else if (resp.fid === "sim") k = "anual";
    else if (resp.fam === "sim") k = "familia";
    else k = "mensal";
    const p = PLANOS[k];
    document.getElementById("fPlan").textContent = p.nome;
    document.getElementById("fPrice").textContent = p.preco;
    document.getElementById("fWhy").textContent = p.why;
    document.getElementById("fCta").href = waLink(`Olá! Vi no site que o ${p.nome} (${p.preco}) é o ideal pra mim. Como faço pra assinar?`);
    document.querySelectorAll("[data-plan]").forEach((el) => el.classList.toggle("match", p.hl.includes(el.dataset.plan)));
    const out = document.querySelector(".finder__out");
    out.classList.remove("flash"); void out.offsetWidth; out.classList.add("flash");
  }
  document.querySelectorAll(".chips").forEach((g) => {
    g.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      g.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      resp[g.dataset.q] = b.dataset.v;
      recomendar();
    });
  });

  // ---------- nav ----------
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const burger = document.querySelector(".nav__burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  document.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", false);
      document.body.style.overflow = "";
    })
  );

  // ---------- reveal ----------
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    io.observe(el);
  });

  // ---------- galeria arrastável ----------
  const strip = document.querySelector(".strip");
  if (strip) {
    let down = false, x0 = 0, s0 = 0;
    strip.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; x0 = e.clientX; s0 = strip.scrollLeft; strip.classList.add("drag"); });
    window.addEventListener("pointerup", () => { down = false; strip.classList.remove("drag"); });
    strip.addEventListener("pointermove", (e) => { if (down) strip.scrollLeft = s0 - (e.clientX - x0); });
  }

  // ---------- init ----------
  const tick = () => { status(); hojeTabela(); renderGrade(); };
  tick();
  recomendar();
  document.querySelectorAll("[data-plan]").forEach((el) => el.classList.remove("match")); // sem destaque até o usuário interagir
  setInterval(tick, 60 * 1000);
})();
