// === Utilidades para el layout del hemiciclo ===

function allocateByLargestRemainder(floats, total) {
    const base = floats.map(Math.floor);
    let used = base.reduce((a, b) => a + b, 0);
    const rema = floats.map((x, i) => ({ i, r: x - Math.floor(x) }));
    rema.sort((a, b) => b.r - a.r);
    let k = 0;
    while (used < total) {
      base[rema[k].i]++;
      used++;
      k++;
    }
    return base;
  }
  
  export function layoutHemicircle(
    totalSeats,
    { rings = 6, innerGap = 0.28, startAngle = 0, endAngle = Math.PI } = {}
  ) {
    if (!totalSeats || totalSeats <= 0) return [];
    const R = 1;
    const r0 = Math.max(0, Math.min(0.95, innerGap)) * R;
    const ringStep = rings > 1 ? (R - r0) / (rings - 1) : 0;
  
    const arc = endAngle - startAngle;
    const circumfs = Array.from({ length: rings }, (_, i) => (r0 + i * ringStep) * arc);
    const sumCirc = circumfs.reduce((a, b) => a + b, 0);
    const ideal = circumfs.map((c) => (c / sumCirc) * totalSeats);
    const seatsPerRing = allocateByLargestRemainder(ideal, totalSeats);
  
    const all = [];
    for (let ring = 0; ring < rings; ring++) {
      const n = seatsPerRing[ring];
      if (n === 0) continue;
      const radius = r0 + ring * ringStep;
      for (let j = 0; j < n; j++) {
        const t = n === 1 ? 0.5 : j / (n - 1);
        const a = startAngle + t * arc;
        const x = 50 + 50 * radius * Math.cos(a);
        const y = 95 - 50 * radius * Math.sin(a);
        all.push({ x, y, ring, t, radius, angle: a, indexInRing: j });
      }
    }
  
    all.sort((p, q) => (p.t === q.t ? q.radius - p.radius : p.t - q.t));
    return all;
  }
  
  export function assignSeatsByParty(parties) {
    const seatMap = [];
    parties.forEach((p, idx) => {
      for (let i = 0; i < (p.seats || 0); i++) seatMap.push(idx);
    });
    return seatMap;
  }
  
  export function absoluteMajority(total) {
    return Math.floor(total / 2) + 1;
  }  