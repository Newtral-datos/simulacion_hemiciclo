<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // === API y configuración base ===
  export let parties = [];
  export let title = 'Hemiciclo';
  export let majority = null;
  export let showChips = true;
  export let titleBg = null;

  export let baseRadius = 80;
  export let baseThickness = 40;
  export let baseCy = 100;
  export let cx = 52;

  export let autoScale = true;
  export let referenceWidthPx = 750;
  export let minScale = 0.75;
  export let maxScale = 1.35;

  const dispatch = createEventDispatcher();

  // === Observador de tamaño ===
  let hostEl;
  let hostWidth = referenceWidthPx;
  let ro;
  onMount(() => {
    ro = new ResizeObserver((entries) => {
      for (const e of entries) hostWidth = e.contentRect.width || referenceWidthPx;
    });
    if (hostEl) ro.observe(hostEl);
  });
  onDestroy(() => ro && ro.disconnect());

  // === Ajustes responsivos ===
  $: isMobile = hostWidth <= 480;
  $: baseRadius = isMobile ? 70 : 80;
  $: baseThickness = isMobile ? 40 : 40;

  $: scale = autoScale ? clamp(hostWidth / referenceWidthPx, minScale, maxScale) : 1;
  $: radius = baseRadius * scale;
  $: thickness = Math.max(8, Math.round(baseThickness * scale));

  // Posición vertical y viewBox con acolchado extra (evita recortes en WordPress)
  $: MOBILE_TOP_MARGIN = isMobile ? clamp(10 + thickness * 0.45, 18, 54) : 30;
  $: cy = isMobile
    ? clamp(radius + MOBILE_TOP_MARGIN, 70, 98)
    : clamp(baseCy + (scale - 1) * 4, 88, 98);

  $: overshootArc  = Math.max(0, radius + thickness / 2 - cy);
  $: overshootTick = Math.max(0, radius + thickness * 0.1 - cy);
  $: VB_SAFETY = isMobile ? 6 : 4;
  $: vbPadTop = Math.ceil(Math.max(overshootArc, overshootTick) + VB_SAFETY);

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // === Cálculos del hemiciclo ===
  $: total = parties.reduce((a, p) => a + (p.seats || 0), 0);
  $: maj = 175; // o usa: majority ?? (Math.floor(total/2)+1)

  const polar = (a, r) => ({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
  function arcPath(aStart, aEnd, r = radius) {
    const p1 = polar(aStart, r);
    const p2 = polar(aEnd, r);
    const span = Math.abs(aStart - aEnd);
    const laf = span >= Math.PI / 2 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${laf} 1 ${p2.x} ${p2.y}`;
  }

  // === Selección y acumulación desde la izquierda ===
  let selectedIds = new Set();
  function toggleParty(id) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    selectedIds = new Set(selectedIds);
    dispatch('change', { selected: Array.from(selectedIds) });
  }
  function clearSelection() {
    selectedIds = new Set();
    dispatch('change', { selected: [] });
  }

  $: selectedTotal = parties
    .filter(p => selectedIds.has(p.id))
    .reduce((a, p) => a + (p.seats || 0), 0);
  $: reachMaj = selectedTotal >= maj;

  const selectedTween = tweened(0, { duration: 220, easing: cubicOut });
  $: selectedTween.set(selectedTotal);

  $: selectedSegments = (() => {
    let acc = 0;
    return parties
      .filter(p => selectedIds.has(p.id))
      .map((p) => {
        const s = p.seats || 0;
        const startAngle = total ? Math.PI * (1 - acc / total) : Math.PI;
        const endAngle   = total ? Math.PI * (1 - (acc + s) / total) : 0;
        acc += s;
        return { ...p, startAngle, endAngle };
      });
  })();

  // === Marcador de mayoría ===
  $: majAngle = total ? Math.PI * (1 - maj / total) : Math.PI;
  $: tick = (() => {
    const a = majAngle;
    const rOuter = radius + thickness * 0.1;
    const rInner = radius - thickness * 0.6;
    const x1 = cx + rOuter * Math.cos(a);
    const y1 = cy - rOuter * Math.sin(a);
    const x2 = cx + rInner * Math.cos(a);
    const y2 = cy - rInner * Math.sin(a);
    return { a, rOuter, rInner, x1, y1, x2, y2 };
  })();

  $: labelPad = Math.max(0.6, Math.min(2, thickness * 0.06));
  $: rLabel = tick.rInner - labelPad;
  $: perp = { x: -Math.sin(majAngle), y: -Math.cos(majAngle) };
  $: sideShift = Math.max(0.8, Math.min(1.6, thickness * 0.04));
  const labelOffsetX = -23;
  const labelOffsetY = 15;
  const labelFontSize = 6.0;
  $: labelX = cx + rLabel * Math.cos(majAngle) + perp.x * sideShift + labelOffsetX;
  $: labelY = cy - rLabel * Math.sin(majAngle) + perp.y * sideShift + labelOffsetY;

  // === Animación de arcos ===
  function draw(node, { duration = 380 } = {}) {
    const len = node.getTotalLength ? node.getTotalLength() : 0;
    node.style.strokeDasharray = `${len}`;
    node.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      node.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.22,0.61,0.36,1)`;
      node.style.strokeDashoffset = '0';
    });
    return { destroy() { node.style.transition = ''; node.style.strokeDasharray = ''; node.style.strokeDashoffset = ''; } };
  }
</script>

<div class="wrap {isMobile ? 'mobile' : 'desktop'}" bind:this={hostEl}>
  <header class="hdr" class:reached={reachMaj}>
    <h2 class="ttl" style="background:{titleBg ?? 'transparent'}">{title}</h2>
    <div class="st">
      <span>{Math.round($selectedTween)}/{total}</span>
      <span class:ok={reachMaj} class:warn={!reachMaj}>Mayoría: {maj}</span>
    </div>
  </header>

  <div class="viz" class:reached={reachMaj}>
    <svg
      viewBox={`0 ${-vbPadTop} 100 ${100 + vbPadTop}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Hemiciclo"
    >
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        class="base"
        stroke-width={thickness}
      />
      {#each selectedSegments as seg (seg.id)}
        {#if seg.startAngle > seg.endAngle}
          <path
            d={arcPath(seg.startAngle, seg.endAngle, radius)}
            fill="none"
            stroke={seg.color}
            stroke-width={thickness}
            use:draw={{ duration: 420 }}
          >
            <title>{seg.name} · {seg.seats} escaños</title>
          </path>
        {/if}
      {/each}
      {#if total > 0}
        <line x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} class="maj" />
        <text
          x={labelX}
          y={labelY}
          text-anchor="start"
          dominant-baseline="middle"
          class="majtxt strong"
          style="font-size:{labelFontSize}px"
        >
          Aprobación: {maj}
        </text>
      {/if}
    </svg>
  </div>

  {#if showChips}
    <div class="ctrls">
      <button class="ghost" on:click={clearSelection}>Limpiar</button>
      <div class="chips" role="group" aria-label="Partidos">
        {#each parties as p (p.id)}
          <button
            class="chip"
            on:click={() => toggleParty(p.id)}
            aria-pressed={selectedIds.has(p.id)}
            style="--c:{p.color}"
            title={`${p.name} (${p.seats})`}
          >
            <span class="dot" style="background:{p.color}"></span>
            <span class="name">{p.name}</span>
            <small>{p.seats}</small>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* ===== Comunes ===== */
  .wrap { 
    display: grid; 
    gap: .6rem; 
    padding: .75rem; 
    width: 100%;
    box-sizing: border-box;
  }

  .hdr {
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    gap: .5rem;
    border: 1px solid var(--border); 
    border-radius: .6rem; 
    padding: .6rem .75rem;
    width: 100%;
    box-sizing: border-box;
    transition: background-color .25s ease, border-color .25s ease, box-shadow .25s ease;
  }
  .hdr.reached {
    background: var(--ok-bg-soft);
    border-color: var(--ok);
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--ok), #fff 80%) inset;
  }

  .ttl {
    margin: 0;
    font-size: .95rem;
    font-weight: 700;
    padding: .15rem .4rem;
    border-radius: .35rem;
    color: #062c1f;
  }

  .st { 
    display: flex; 
    gap: .5rem; 
    align-items: center; 
    font-size: .85rem; 
    font-weight: 600; 
  }

  .viz {
    background: var(--panel);
    border: 2px solid var(--border);
    border-radius: .75rem;
    padding: .6rem .75rem;
    width: 100%;
    box-sizing: border-box;
    transition: border-color .25s ease, box-shadow .25s ease, background-color .25s ease;
  }

  .viz.reached {
    border-color: var(--ok);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ok), #fff 80%) inset;
    background: var(--panel);
  }

  svg { width: 100%; height: auto; display: block; }

  .base { stroke: var(--seat-off); transition: stroke .25s ease, stroke-width .2s ease; }
  .maj { stroke: var(--border-strong); stroke-width: 1; }
  .majtxt { fill: var(--text-dim); }
  .strong { font-weight: 700; }

  .ctrls { 
    display: grid; 
    gap: .4rem; 
    width: 100%;
    box-sizing: border-box;
  }

  .ghost {
    background: transparent; 
    border: 1px dashed var(--border);
    color: inherit; 
    padding: .3rem .5rem; 
    border-radius: .4rem; 
    font-size: .8rem;
    transition: transform .12s ease, border-color .2s ease;
  }
  .ghost:active { transform: scale(0.98); }

  /* Chips */
  .chips { display: grid; gap: .4rem; width: 100%; box-sizing: border-box; }

  .chip {
    border: 2px solid var(--border);
    background: var(--bg-soft);
    padding: .28rem .6rem;
    border-radius: 999px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: .8rem;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    transition:
      box-shadow .15s ease,
      border-color .15s ease,
      transform .08s ease,
      margin-top .08s ease;
  }

  .chip:hover { transform: translateY(-1px); }
  .chip:active { transform: translateY(0); }

  .chip[aria-pressed="true"] {
    border-color: var(--c);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--c), #fff 75%);
    margin-top: 2px;
  }

  .chip:focus,
  .chip:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .dot { inline-size: .6rem; block-size: .6rem; border-radius: 999px; margin-right: .4rem; }
  .name { flex: 1; overflow: hidden; text-overflow: ellipsis; text-align: left; }
  small { margin-left: .5rem; font-weight: 600; }

  /* ===== Escritorio/Tablet ===== */
  .wrap.desktop .chips {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: .4rem .5rem;
    overflow: hidden;
    align-content: start;
  }

  .wrap.desktop .viz {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ===== Móvil ===== */
  .wrap.mobile { padding: .55rem; gap: .45rem; }
  .wrap.mobile .ttl { font-size: .9rem; }
  .wrap.mobile .viz { padding: .35rem; }
  .wrap.mobile .chips {
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    overflow-x: hidden;
    gap: .32rem;
  }
  .wrap.mobile .chip {
    font-size: .76rem;
    padding: .22rem .38rem;
  }
  .wrap.mobile .name { max-width: 7rem; }

  :global(:root) {
    --bg: #ffffff;
    --bg-soft: #fafafa;
    --panel: #ffffff;
    --border: #dadde3;
    --border-strong: #bfc5ce;
    --text: #111111;
    --text-dim: #555;
    --ok: #1ad598;
    --ok-bg-soft: rgba(26, 213, 152, 0.14);
    --ok-bg-verysoft: rgba(26, 213, 152, 0.08);
    --warn: #e18b00;
    --seat-off: #e6e9ef;
  }
</style>
