<script>
  import VoteBar from './lib/components/VoteBar.svelte';

  let parties = [
    { id: 'PSOE', name: 'PSOE', seats: 120, color: '#E3001B' },
    { id: 'PP',   name: 'PP',   seats: 137,  color: '#1E5CA8' },
    { id: 'VOX',  name: 'VOX',  seats: 33,  color: '#5BC500' },
    { id: 'SUM',  name: 'Sumar',seats: 26,  color: '#D6006B' },
    { id: 'ERC',  name: 'ERC',  seats: 7,   color: '#FFCC00' },
    { id: 'JxC',  name: 'Junts',seats: 7,   color: '#00A3E0' },
    { id: 'EHB',  name: 'EH Bildu', seats: 6, color: '#78B82A' },
    { id: 'PNV',  name: 'EAJ-PNV',  seats: 5,   color: '#2E7D32' },
    { id: 'Podemos',  name: 'Podemos',  seats: 4,   color: '#8C66ED' },
    { id: 'CCa',  name: 'CCa',  seats: 1,   color: '#3cb371' },
    { id: 'BNG',  name: 'BNG',  seats: 1,   color: '#76AADB' },
    { id: 'UPN',  name: 'UPN',  seats: 1,   color: '#76AADB' },
    { id: 'Ábalos',  name: 'Ábalos',  seats: 1,   color: '#d8d8d8' },
    { id: 'Águeda Micó',  name: 'Águeda Micó',  seats: 1,   color: '#d8d8d8' },
  ];
</script>

<main class="page">
  <VoteBar {parties} title="Simulación de votaciones" />
</main>

<style>
  .page{
    min-height:100vh;
    background:#fff;
    color:#111;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,Inter,sans-serif;
    padding:.6rem;
    display:flex;flex-direction:column;align-items:center;gap:.6rem
  }
  h1{font-size:1.2rem;margin:.2rem 0 .1rem}
  :global(body){margin:0;background:#fff}
</style>