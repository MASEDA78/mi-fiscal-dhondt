let votosGlobal = [];
let totalVotosGlobal = 0;

function calcularDhondt() {
  const candidatos = document.querySelectorAll('.candidate');
  const votos = [];
  let totalVotos = 0;

  candidatos.forEach(c => {
    const nombre = c.dataset.name;
    const partido = c.dataset.party;
    const img = c.dataset.img;
    const valor = parseInt(c.querySelector('input').value) || 0;

    if (valor < 0) {
      alert(`Voto inválido para ${nombre}. No se permiten valores negativos.`);
      return;
    }

    votos.push({ nombre, partido, img, votos: valor, bancas: 0 });
    totalVotos += valor;
  });

  if (totalVotos === 0) {
    alert("Por favor, ingrese al menos un voto válido.");
    return;
  }

  const coeficientes = [];

  votos.forEach(candidato => {
    for (let j = 1; j <= 5; j++) {
      coeficientes.push({
        nombre: candidato.nombre,
        partido: candidato.partido,
        img: candidato.img,
        valor: candidato.votos / j
      });
    }
  });

  coeficientes.sort((a, b) => b.valor - a.valor);

  for (let i = 0; i < 5; i++) {
    const ganador = coeficientes[i];
    const partidoGanador = votos.find(v => v.nombre === ganador.nombre);
    partidoGanador.bancas += 1;
  }

  votosGlobal = votos;
  totalVotosGlobal = totalVotos;
  mostrarResultados(votos, totalVotos);
}

function mostrarResultados(votos, totalVotos) {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = '';

  votos.sort((a, b) => b.votos - a.votos);

  // Calcular porcentajes con corrección
  let porcentajes = votos.map(c => (c.votos / totalVotos) * 100);
  let porcentajesRedondeados = porcentajes.map(p => Math.floor(p * 100) / 100);
  let suma = porcentajesRedondeados.reduce((acc, p) => acc + p, 0);
  let diferencia = parseFloat((100 - suma).toFixed(2));

  if (diferencia !== 0) {
    let residuos = porcentajes.map((p, i) => ({ i, residuo: p - porcentajesRedondeados[i] }));
    residuos.sort((a, b) => b.residuo - a.residuo);
    porcentajesRedondeados[residuos[0].i] += diferencia;
  }

  // Mostrar resumen
  const resumen = document.createElement('div');
  resumen.innerHTML = `
    <p><strong>Total de votos:</strong> ${totalVotos}</p>
    <p><strong>Suma de porcentajes:</strong> 100.00%</p>
  `;
  contenedor.appendChild(resumen);

  votos.forEach((c, i) => {
    const porcentaje = porcentajesRedondeados[i].toFixed(2);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${c.img}" alt="${c.nombre}" />
      <div class="info">
        <h3>${c.nombre}</h3>
        <p><strong>Partido:</strong> ${c.partido}</p>
        <p><strong>Votos:</strong> ${c.votos}</p>
        <p><strong>Porcentaje:</strong> ${porcentaje}%</p>
        <p><strong>Bancas:</strong> ${c.bancas}</p>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Distribución de Bancas - Sistema D’Hondt", 20, 20);

  let y = 30;

  let porcentajes = votosGlobal.map(c => (c.votos / totalVotosGlobal) * 100);
  let porcentajesRedondeados = porcentajes.map(p => Math.floor(p * 100) / 100);
  let suma = porcentajesRedondeados.reduce((acc, p) => acc + p, 0);
  let diferencia = parseFloat((100 - suma).toFixed(2));
  if (diferencia !== 0) {
    let residuos = porcentajes.map((p, i) => ({ i, residuo: p - porcentajesRedondeados[i] }));
    residuos.sort((a, b) => b.residuo - a.residuo);
    porcentajesRedondeados[residuos[0].i] += diferencia;
  }

  votosGlobal.forEach((c, i) => {
    const porcentaje = porcentajesRedondeados[i].toFixed(2);
    doc.setFontSize(12);
    doc.text(`• ${c.nombre} (${c.partido})`, 20, y);
    doc.text(`Votos: ${c.votos} | %: ${porcentaje}% | Bancas: ${c.bancas}`, 25, y + 7);
    y += 20;
  });

  doc.setFontSize(10);
  doc.text("Castelli, Buenos Aires – Elecciones Municipales", 20, y + 10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, y + 17);
  doc.text("Suma de porcentajes: 100.00%", 20, y + 24);

  doc.save("resultados-dhondt.pdf");
}
