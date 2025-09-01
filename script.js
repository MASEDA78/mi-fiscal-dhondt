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
    votos.push({ nombre, partido, img, votos: valor, bancas: 0 });
    totalVotos += valor;
  });

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

  votos.forEach(c => {
    const porcentaje = ((c.votos / totalVotos) * 100).toFixed(2);
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
  votosGlobal.sort((a, b) => b.votos - a.votos);
  votosGlobal.forEach(c => {
    const porcentaje = ((c.votos / totalVotosGlobal) * 100).toFixed(2);
    doc.setFontSize(12);
    doc.text(`• ${c.nombre} (${c.partido})`, 20, y);
    doc.text(`Votos: ${c.votos} | %: ${porcentaje}% | Bancas: ${c.bancas}`, 25, y + 7);
    y += 20;
  });

  doc.setFontSize(10);
  doc.text("Castelli, Buenos Aires – Elecciones Municipales", 20, y + 10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, y + 17);

  doc.save("resultados-dhondt.pdf");
}