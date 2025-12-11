<script>
  export let parties = []; // [{id, name, seats, color}]
  export let title = 'Simulación de votación';

  let votes = new Map(parties.map(p => [p.id, 'abst']));

  $: total = parties.reduce((a, p) => a + (p.seats || 0), 0);
  $: yes = parties.reduce((a, p) => a + (votes.get(p.id) === 'si' ? (p.seats || 0) : 0), 0);
  $: no  = parties.reduce((a, p) => a + (votes.get(p.id) === 'no' ? (p.seats || 0) : 0), 0);
  $: abst = Math.max(0, total - yes - no);

  $: absoluteMaj = Math.floor(total / 2) + 1;
  $: simpleResult = yes > no ? 'Sí' : (yes < no ? 'No' : 'Empate');

  const pct = (n) => total ? (n / total) * 100 : 0;

  function setVote(id, v) {
    votes.set(id, v);
    votes = new Map(votes);
  }

  const vLabel = (id) => votes.get(id) === 'si' ? 'Sí' : votes.get(id) === 'no' ? 'No' : 'Abst.';
</script>

<div class="wrap">
  <header class="hdr">
    <h2 class="ttl">{title}</h2>
    <div class="totals">
      <span class="yes">Sí: {yes}</span>
      <span class="abst">Abst.: {abst}</span>
      <span class="no">No: {no}</span>
      <span class="maj">Mayoría absoluta: {absoluteMaj}</span>
    </div>
  </header>

  <div class="bar" role="img" aria-label="Distribución de votos">
    <div class="seg yes"  style={`width:${pct(yes)}%`}  title={`Sí ${yes}`}></div>
    <div class="seg abst" style={`width:${pct(abst)}%`} title={`Abst. ${abst}`}></div>
    <div class="seg no"   style={`width:${pct(no)}%`}   title={`No ${no}`}></div>
  </div>

  <div class="legend">
    <span class="dot yes"></span><b>Sí</b>
    <span class="dot abst"></span><b>Abstención</b>
    <span class="dot no"></span><b>No</b>
    <span class="spacer"></span>
    <span class="result">
      Resultado simple: <b class={yes>no ? 'yes' : no>yes ? 'no' : ''}>{simpleResult}</b>
    </span>
  </div>

  <div class="chips" role="group" aria-label="Partidos">
    {#each parties as p (p.id)}
      <div class="chip" style={`--c:${p.color}`} title={`${p.name} · ${p.seats} escaños · ${vLabel(p.id)}`}>
        <div class="left">
          <span class="dot" style={`background:${p.color}`}></span>
          <span class="name">{p.name}</span>
        </div>

        <div class="right">
          <small class="seats">{p.seats}</small>
          <div class="segmented" role="group" aria-label={`Voto de ${p.name}`}>
            <button
              class="btn si"
              aria-pressed={votes.get(p.id)==='si'}
              on:click={() => setVote(p.id, 'si')}
              title="Votar Sí"
            >Sí</button>
            <button
              class="btn abst"
              aria-pressed={votes.get(p.id)==='abst'}
              on:click={() => setVote(p.id, 'abst')}
              title="Abstenerse"
            >Abst.</button>
            <button
              class="btn no"
              aria-pressed={votes.get(p.id)==='no'}
              on:click={() => setVote(p.id, 'no')}
              title="Votar No"
            >No</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  /* ===== Base / Escritorio ===== */
  .wrap{display:grid;gap:.6rem;padding:.75rem;max-width:100%;box-sizing:border-box;overflow-x:hidden}
  .hdr{display:flex;justify-content:space-between;align-items:center;gap:.5rem;border:1px solid #dadde3;border-radius:.6rem;padding:.55rem .7rem;background:#fff}
  .ttl{margin:0;font-size:.98rem;font-weight:800}
  .totals{display:flex;gap:.7rem;align-items:center;font-weight:600}
  .yes{color:#1a9e5a}.no{color:#c62828}.abst{color:#6b7280}.maj{color:#444;font-weight:600}

  .bar{display:flex;height:26px;border:1px solid #dadde3;border-radius:999px;overflow:hidden;background:#f4f6f9;width:100%}
  .seg{height:100%}
  .seg.yes{background:#19c37d}
  .seg.abst{background:#e5e7eb}
  .seg.no{background:#ef4444}

  .legend{display:flex;align-items:center;gap:.5rem;color:#444}
  .legend .dot{width:.7rem;height:.7rem;border-radius:999px;display:inline-block;margin-right:.25rem}
  .legend .dot.yes{background:#19c37d}.legend .dot.abst{background:#e5e7eb}.legend .dot.no{background:#ef4444}
  .legend .spacer{flex:1}

  .chips{display:grid;gap:.5rem;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
  .chip{border:1px solid #d0d6e3;background:#fff;padding:.45rem .6rem;border-radius:.9rem;display:flex;align-items:center;justify-content:space-between;gap:.8rem;min-width:0}
  .left{display:flex;align-items:center;gap:.45rem;min-width:0}
  .dot{width:.7rem;height:.7rem;border-radius:999px;flex:0 0 auto}
  .name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
  .right{display:flex;align-items:center;gap:.55rem}
  .seats{font-weight:700;opacity:.85;min-width:2.2ch;text-align:right}

  .segmented{display:inline-grid;grid-template-columns:repeat(3,auto);border:1px solid #d7dce6;border-radius:.6rem;overflow:hidden}
  .btn{padding:.22rem .5rem;font-size:.78rem;line-height:1;border:none;background:#fff;color:#374151;cursor:pointer}
  .btn + .btn{border-left:1px solid #d7dce6}
  .btn[aria-pressed="true"]{font-weight:700}
  .btn.si[aria-pressed="true"]{background:#19c37d1a;color:#0b6b44;border-color:#19c37d33}
  .btn.abst[aria-pressed="true"]{background:#eef1f6}
  .btn.no[aria-pressed="true"]{background:#ef44441a;color:#7a1f1f;border-color:#ef444433}

  /* ===== Móvil ===== */
  @media (max-width: 600px){
    .wrap{padding:.6rem .5rem}
    .hdr{flex-direction:column;align-items:flex-start;gap:.35rem}
    .totals{flex-wrap:wrap;gap:.45rem;font-size:.95rem}
    .bar{height:22px}

    /* Más columnas con tarjetas más estrechas, sin scroll horizontal */
    .chips{
      grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
      gap:.38rem;
      overflow:visible;
    }

    /* Reorganiza cada chip para que quepa: nombre arriba, controles a ancho completo */
    .chip{
      padding:.4rem .5rem;
      gap:.45rem;
      flex-direction:column;
      align-items:stretch;
    }
    .left{gap:.35rem}
    .right{width:100%;display:flex;align-items:center;gap:.45rem;justify-content:space-between}
    .seats{order:2;min-width:auto}
    .segmented{width:100%}
    .btn{flex:1;padding:.2rem .35rem;font-size:.72rem}
    .legend{flex-wrap:wrap;gap:.45rem}
  }
</style>
