/* ============================================================
   MARCELLO RIBEIRO — CONSULTOR ADEMICON
   Taxas oficiais: Imóveis 1,33% a.a. · Veículos 2,00% a.a.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURAÇÃO DE PRAZOS E TAXAS POR TIPO DE BEM
     Taxa anual diluída no cálculo: a parcela é calculada
     dividindo o valor pelo prazo e adicionando a taxa anual
     proporcional ao prazo total.
     ============================================================ */
  const PRAZOS = {
    imovel: {
      nome: 'Imóvel',
      taxaAnual: 0.0133,   // 1,33% ao ano
      max: 220,
      opcoes: [100, 150, 200, 220],
      default: 220,
      taxaLabel: '1,33% ao ano'
    },
    veiculo: {
      nome: 'Veículo',
      taxaAnual: 0.0200,   // 2,00% ao ano
      max: 90,
      opcoes: [60, 70, 80, 90],
      default: 90,
      taxaLabel: '2,00% ao ano'
    },
    moto: {
      nome: 'Moto',
      taxaAnual: 0.0200,
      max: 90,
      opcoes: [60, 70, 80, 90],
      default: 90,
      taxaLabel: '2,00% ao ano'
    },
    servicos: {
      nome: 'Serviços',
      taxaAnual: 0.0200,
      max: 120,
      opcoes: [60, 80, 100, 120],
      default: 120,
      taxaLabel: '2,00% ao ano'
    }
  };

  const state = {
    valor: 80000,
    prazo: 220,
    tipo: 'imovel'
  };

  const THEME_KEY = 'marcello-theme';

  /* ============================================================
     TEMA
     ============================================================ */
  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', toggleTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    });
  }

  /* ============================================================
     CÁLCULO DE PARCELA com taxa real anual
     Fórmula: parcela = (valor / prazo) * (1 + taxaAnual * (prazo/12))
     ============================================================ */
  function calcularParcela(valor, prazo, taxaAnual) {
    const anos = prazo / 12;
    const fator = 1 + (taxaAnual * anos);
    return (valor / prazo) * fator;
  }

  /* ============================================================
     FORMATAÇÃO
     ============================================================ */
  function formatBRL(valor) {
    return Math.round(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function formatParcela(valor) {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* ============================================================
     HERO MINI-SIMULADOR
     ============================================================ */
  function initHeroSim() {
    const range = document.getElementById('heroRange');
    const valorEl = document.getElementById('heroValor');
    const parcelaEl = document.getElementById('heroParcela');
    const tabs = document.querySelectorAll('#heroTabs .sim-widget__tab');
    const chipsContainer = document.getElementById('heroPrazos');
    const prazoMaxEl = document.getElementById('heroPrazoMax');
    const taxaInfoEl = document.getElementById('heroTaxaInfo');

    if (!range || !valorEl || !parcelaEl || !chipsContainer) return;

    let tipoAtual = 'imovel';
    let prazo = PRAZOS.imovel.default;

    function renderizarChipsPrazo() {
      const config = PRAZOS[tipoAtual];
      chipsContainer.innerHTML = config.opcoes.map(m => `
        <button class="chip${m === prazo ? ' is-active' : ''}" data-months="${m}" type="button">${m}x</button>
      `).join('');

      chipsContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          prazo = parseInt(chip.dataset.months, 10);
          update();
        });
      });

      if (prazoMaxEl) prazoMaxEl.textContent = `máx. ${config.max} meses`;
    }

    function update() {
      const valor = parseInt(range.value, 10);
      valorEl.textContent = formatBRL(valor);
      const config = PRAZOS[tipoAtual];
      const p = calcularParcela(valor, prazo, config.taxaAnual);
      parcelaEl.textContent = formatParcela(p);
      if (taxaInfoEl) taxaInfoEl.textContent = `Taxa Adm. ${config.taxaLabel} · Valores aproximados`;
    }

    range.addEventListener('input', update);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        tipoAtual = tab.dataset.type;
        const config = PRAZOS[tipoAtual];
        prazo = config.default;

        renderizarChipsPrazo();
        update();
      });
    });

    renderizarChipsPrazo();
    update();
  }

  /* ============================================================
     SIMULADOR COMPLETO
     ============================================================ */
  function initSimuladorCompleto() {
    const range = document.getElementById('simValor');
    const display = document.getElementById('simValorDisplay');
    const chipsTipo = document.querySelectorAll('#simTipo .chip');
    const chipsPrazo = document.querySelectorAll('#simPrazo .chip');
    const prazoMaxEl = document.getElementById('simPrazoMax');

    const parcelaEl = document.getElementById('simParcela');
    const detailValor = document.getElementById('simDetailValor');
    const detailPrazo = document.getElementById('simDetailPrazo');
    const detailTipo = document.getElementById('simDetailTipo');
    const detailTaxa = document.getElementById('simDetailTaxa');
    const detailTotal = document.getElementById('simDetailTotal');

    if (!range || !display || !parcelaEl) return;

    function atualizarPrazosDisponiveis() {
      const config = PRAZOS[state.tipo];

      chipsPrazo.forEach(chip => {
        const meses = parseInt(chip.dataset.months, 10);
        const habilitado = meses <= config.max;
        chip.disabled = !habilitado;
        chip.classList.toggle('is-active', meses === state.prazo);
      });

      if (prazoMaxEl) prazoMaxEl.textContent = `máx. ${config.max} meses`;
    }

    function update() {
      const valor = parseInt(range.value, 10);
      state.valor = valor;
      display.value = formatBRL(valor);

      const config = PRAZOS[state.tipo];
      const p = calcularParcela(valor, state.prazo, config.taxaAnual);
      const total = p * state.prazo;

      parcelaEl.textContent = formatParcela(p);
      detailValor.textContent = 'R$ ' + formatBRL(valor);
      detailPrazo.textContent = state.prazo + ' meses';
      detailTipo.textContent = config.nome;
      if (detailTaxa) detailTaxa.textContent = config.taxaLabel;
      detailTotal.textContent = 'R$ ' + formatBRL(total);
    }

    range.addEventListener('input', update);

    chipsTipo.forEach(chip => {
      chip.addEventListener('click', () => {
        chipsTipo.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        state.tipo = chip.dataset.type || 'imovel';
        const config = PRAZOS[state.tipo];

        if (state.prazo > config.max) {
          state.prazo = config.default;
        }

        atualizarPrazosDisponiveis();
        update();
      });
    });

    chipsPrazo.forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.disabled) return;

        const meses = parseInt(chip.dataset.months, 10);
        const config = PRAZOS[state.tipo];
        if (meses > config.max) return;

        chipsPrazo.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.prazo = meses;
        update();
      });
    });

    atualizarPrazosDisponiveis();
    update();
  }

  /* ============================================================
     DADOS DE EXTERIOR
     ============================================================ */
  const EXTERIOR_DATA = {
    geral: {
      headers: ['Crédito', 'Em Libras', 'Em Euros', 'Em Dólares'],
      rows: [
        ['R$ 120 mil', '£ 58,29', '€ 67,46', '$ 77,91'],
        ['R$ 250 mil', '£ 121,43', '€ 140,54', '$ 162,29'],
        ['R$ 300 mil', '£ 145,71', '€ 168,65', '$ 194,73'],
        ['R$ 450 mil', '£ 218,57', '€ 252,98', '$ 292,13'],
        ['R$ 600 mil', '£ 262,80', '€ 304,16', '$ 351,24']
      ]
    },
    irlanda: {
      headers: ['Crédito', 'Parcela em EUR'],
      rows: [
        ['100 mil', '€ 72,78'],
        ['250 mil', '€ 182,76'],
        ['500 mil', '€ 363,91'],
        ['850 mil', '€ 627,16'],
        ['1 Milhão', '€ 737,84']
      ]
    }
  };

  function renderExteriorTabela(regiao) {
    const tabela = document.getElementById('exteriorTabela');
    if (!tabela) return;

    const data = EXTERIOR_DATA[regiao];
    if (!data) return;

    tabela.innerHTML = `
      <table class="tabela">
        <thead>
          <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.rows.map(row => `
            <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function initExterior() {
    const tabs = document.querySelectorAll('#exteriorTabs .exterior-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        renderExteriorTabela(tab.dataset.region);
      });
    });

    renderExteriorTabela('geral');
  }

  /* ============================================================
     DADOS FALLBACK — FAQ
     ============================================================ */
  function fallbackFaq() {
    return [
      {
        pergunta: 'O que é consórcio e como ele funciona?',
        resposta: 'O consórcio é uma forma planejada de conquistar bens ou serviços sem juros e sem entrada. Um grupo de pessoas se reúne, cada uma contribui mensalmente, e através de sorteios e lances os participantes são contemplados com a carta de crédito para realizar a compra.'
      },
      {
        pergunta: 'Consórcio tem juros?',
        resposta: 'Não. No consórcio você paga apenas a taxa de administração — que é a partir de 1,33% ao ano para imóveis e 2,00% ao ano para veículos, motos e serviços. É muito menor que os juros compostos de um financiamento bancário.'
      },
      {
        pergunta: 'Qual a taxa de administração da Ademicon?',
        resposta: 'Para imóveis, a taxa é de 1,33% ao ano. Para veículos, motos e serviços, é de 2,00% ao ano. Essa taxa é diluída em todas as parcelas e calculada sobre o valor do crédito, durante todo o prazo do plano.'
      },
      {
        pergunta: 'Qual o prazo máximo de cada consórcio?',
        resposta: 'Os prazos variam conforme o tipo de bem: Imóveis vão até 220 meses, Veículos e Motos até 90 meses, Serviços até 120 meses. Cada segmento possui regras e grupos próprios regulados pela Ademicon.'
      },
      {
        pergunta: 'Posso morar no exterior e ter um consórcio no Brasil?',
        resposta: 'Sim! A Ademicon tem planos especiais para brasileiros que moram em Portugal, Irlanda, EUA, Reino Unido e outros países. Você pode pagar em Reais ou em moeda local (Libras, Euros ou Dólares), conforme o plano escolhido.'
      },
      {
        pergunta: 'Como faço para ser contemplado mais rápido?',
        resposta: 'Existem duas formas: pelo sorteio mensal (que é aleatório) ou através de lances. Os lances são ofertas que você faz para antecipar sua contemplação, e existem várias modalidades (lance livre, lance fixo, lance embutido). Eu te ajudo a escolher a melhor estratégia para o seu caso.'
      },
      {
        pergunta: 'Preciso dar entrada?',
        resposta: 'Não. Uma das grandes vantagens do consórcio é que você não precisa dar entrada. Você começa a pagar as parcelas mensais e, quando for contemplado, já tem acesso ao valor integral da carta de crédito.'
      },
      {
        pergunta: 'Existe parcela reduzida até a contemplação?',
        resposta: 'Sim! A Ademicon trabalha com planos de parcela reduzida até a contemplação — você paga um valor menor durante o período de espera e, após ser contemplado, a parcela é ajustada. Isso facilita muito o planejamento no início.'
      },
      {
        pergunta: 'O consórcio é seguro?',
        resposta: 'Sim. Todo o processo é regulamentado pelo Banco Central do Brasil. A Ademicon é a maior administradora independente de consórcios do país, com 35 anos de mercado, mais de 675 mil clientes atendidos e 300 lojas no Brasil.'
      },
      {
        pergunta: 'Qual o valor mínimo para começar?',
        resposta: 'Existem planos a partir de R$ 80.000 de crédito, com parcelas a partir de R$ 269,84. Você pode ajustar o valor do crédito e o prazo no simulador para ver a parcela estimada. Me chame no WhatsApp que faço uma simulação personalizada para você.'
      }
    ];
  }

  /* ============================================================
     CARREGAMENTO DE DADOS
     ============================================================ */
  function carregarDados() {
    fetch('dados.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        renderFaq(data.faq || fallbackFaq());
      })
      .catch(() => {
        renderFaq(fallbackFaq());
      })
      .finally(() => {
        setTimeout(initReveal, 100);
      });
  }

  /* ============================================================
     RENDER — FAQ
     ============================================================ */
  function renderFaq(itens) {
    const lista = document.getElementById('faqList');
    if (!lista) return;

    lista.innerHTML = itens.map((item, i) => `
      <div class="faq-item reveal" data-faq="${i}">
        <button class="faq-item__q" type="button" aria-expanded="false">
          <span>${item.pergunta}</span>
          <span class="faq-item__icon"></span>
        </button>
        <div class="faq-item__a">
          <div class="faq-item__a-inner">${item.resposta}</div>
        </div>
      </div>
    `).join('');

    lista.querySelectorAll('.faq-item__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');

        lista.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('is-open');
          i.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================================
     NAV
     ============================================================ */
  function initNav() {
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');

    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    });

    nav?.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle?.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (!nav || !nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  /* ============================================================
     PROGRESS BAR
     ============================================================ */
  function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ============================================================
     CONTADORES
     ============================================================ */
  function initCounters() {
    const stats = document.querySelectorAll('.stat[data-count]');
    if (!stats.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const numEl = el.querySelector('.stat__num');
        if (!numEl) return;

        let current = 0;
        const duration = 1800;
        const startTime = performance.now();

        function tick(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(target * eased);
          numEl.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            numEl.textContent = target + suffix;
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(s => observer.observe(s));
  }

  /* ============================================================
     REVEAL
     ============================================================ */
  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ============================================================
     COMPARADOR
     ============================================================ */
  function initComparadorAnim() {
    const compare = document.querySelector('.compare');
    if (!compare) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          compare.classList.add('is-visible');
          observer.unobserve(compare);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(compare);
  }

  /* ============================================================
     FOOTER
     ============================================================ */
  function initFooter() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferredTheme());

    initThemeToggle();
    carregarDados();
    initHeroSim();
    initSimuladorCompleto();
    initExterior();
    initNav();
    initProgressBar();
    initCounters();
    initComparadorAnim();
    initFooter();
  });

})();