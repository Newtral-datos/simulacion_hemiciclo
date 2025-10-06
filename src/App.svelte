<script>
  import Hemicycle from './lib/components/Hemicycle.svelte';

  // Datos de ejemplo (puedes cambiarlos libremente)
  let parties = [
    { id: 'PP',   name: 'PP',   seats: 137, color: '#1E5CA8' },
    { id: 'PSOE', name: 'PSOE', seats: 120, color: '#E3001B' },
    { id: 'VOX',  name: 'VOX',  seats: 33,  color: '#5BC500' },
    { id: 'SUM',  name: 'Sumar',seats: 26,  color: '#D6006B' },
    { id: 'ERC',  name: 'ERC',  seats: 7,   color: '#FFCC00' },
    { id: 'JxC',  name: 'Junts', seats: 7,   color: '#00A3E0' },
    { id: 'EHB',  name: 'EH Bildu', seats: 6, color: '#78B82A' },
    { id: 'EAJ-PNV', name: 'EAJ-PNV', seats: 5, color: '#499E37' },
    { id: 'CC',  name: 'CC',  seats: 1,   color: '#FED702' },
    { id: 'UPN',  name: 'UPN',  seats: 1,   color: '#E51A22' },
    { id: 'BNG',  name: 'BNG',  seats: 1,   color: '#68ABDD' },
    { id: 'Podemos',  name: 'Podemos',  seats: 4, color: '#8C66ED' },
    { id: 'Ábalos',  name: 'Ábalos',  seats: 1,   color: '#d8d8d8' },
    { id: 'Águeda Micó',  name: 'Águeda Micó',  seats: 1,   color: '#d8d8d8' },
  ];

  $: total = parties.reduce((a, p) => a + p.seats, 0);
  $: majority = Math.floor(total / 2) + 1;

  function onChange(e) {
    const selected = e.detail.selected;
    // console.log('Seleccion:', selected);
  }
</script>

<main class="page">
  <h1>Pactómetro</h1>
  <Hemicycle
    {parties}
    {majority}
    radius={42}
    thickness={10}
    cy={82}
    title="Simulación de votaciones"
    on:change={onChange}
  />
</main>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    background: white;
    color: #111;
    min-height: 100vh;
    margin: 0;
    padding: .4rem .6rem;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
  }

  h1 {
    font-size: 1.1rem;
    margin: 0 0 .2rem;
    color: #111;
    text-align: center;
    letter-spacing: -0.02em;
    font-weight: 700;
  }

  :global(:root) {
    --bg: #ffffff;
    --bg-soft: #fafafa;
    --panel: #ffffff;
    --border: #dadde3;
    --border-strong: #bfc5ce;
    --text: #111111;
    --text-dim: #555;
    --ok: #0a8b5c;
    --ok-soft: rgba(10, 139, 92, 0.1);
    --warn: #e18b00;
    --seat-off: #e6e9ef;
  }

  .page :global(.wrap) {
    gap: .4rem;
  }

  .page :global(.hdr) {
    margin-top: .2rem;
  }

  .page :global(.viz) {
    margin-top: -.2rem;
    padding: .3rem .4rem;
  }

  .page :global(svg) {
    max-height: 180px;
  }

  @media (max-height: 500px) {
    .page {
      padding: .25rem;
    }
    h1 {
      font-size: 1rem;
      margin-bottom: .15rem;
    }
    .page :global(svg) {
      max-height: 160px;
    }
  }

  :global(body) {
    margin: 0;
    background: white;
    color: #111;
  }
</style>
