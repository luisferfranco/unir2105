// TODO: 1. Filtro para seleccionar solo un continente
// TODO: 2. Implementar un "slider" (range)
// TODO: 3. Implementar un tooltip

const graf = d3.select('#graf')
const tooltip = d3.select('#tooltip')
const toolheader = d3.select('#tooltip-header')
const toolbody = d3.select('#tooltip-body')

const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const margin = {
  top: 50,
  bottom: 85,
  left: 55,
  right: 30,
}

const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom

// !ESPACIO DE GRAFICACIÓN
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

g.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', ancho)
  .attr('height', alto)
  .attr('stroke', '#333333')
  .attr('fill', '#ffffff77')

const yearDisplay = g
  .append('text')
  .attr('class', 'numerote')
  .attr('x', ancho / 2)
  .attr('y', alto / 2 + 50)
  .attr('text-anchor', 'middle')

// !VARIABLES GLOBALES
let allData = []
let year = 0
let minYear, maxYear
let corriendo = false
let intervalo

// !ELEMENTOS DEL GUI
const txtYear = d3.select('#txt-year')
const btnAtras = d3.select('#btn-atras')
const btnPlay = d3.select('#btn-play')
const btnAdelante = d3.select('#btn-adelante')

// !ESCALADORES
let x = d3.scaleLog().range([0, ancho])
let y = d3.scaleLinear().range([alto, 0])
let r = d3.scaleLinear().range([15, 150])
let color = d3
  .scaleOrdinal()
  .range(['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'])

function carga() {
  d3.csv('gapminder.csv').then((datos) => {
    datos.forEach((d) => {
      d.income = +d.income
      d.life_exp = +d.life_exp
      d.population = +d.population
      d.year = +d.year
    })

    datos = d3.filter(
      datos,
      (d) => d.income > 0 && d.life_exp > 0 && d.population > 0
    )

    allData = datos
    txtYear.attr('value', year)
    minYear = d3.min(datos, (d) => d.year)
    maxYear = d3.max(datos, (d) => d.year)
    year = minYear

    // !DOMINIOS DE LOS ESCALADORES
    x.domain([d3.min(datos, (d) => d.income), d3.max(datos, (d) => d.income)])
    y.domain(d3.extent(d3.map(datos, (d) => d.life_exp)))
    r.domain(d3.extent(d3.map(datos, (d) => d.population)))
    color.domain(d3.map(datos, (d) => d.continet))

    g.append('g')
      .attr('transform', `translate(0, ${alto})`)
      .attr('class', 'ejes')
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickSize(-alto)
          .tickFormat((d) => d3.format(',d')(d))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')
      .attr('x', -10)
      .attr('y', -5)

    g.append('g')
      .attr('class', 'ejes')
      .call(d3.axisLeft(y).ticks(10).tickSize(-ancho))

    cuadro()
  })
}

function dibujo(datos) {
  yearDisplay.text(year)

  burbujas = g.selectAll('circle').data(datos, (d) => d.country)

  burbujas
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.income))
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', 0)
    .attr('fill-opacity', 0.5)
    .attr('stroke', '#bbb')
    .attr('fill', '#0d0')
    .on('mouseenter', (e, d) =>
      showTooltip(
        e,
        d.country,
        `
      <table>
        <tr><td>Población</td><td class="text-end">${d.population}</td></tr>
        <tr><td>PIB Per Cápita</td><td class="text-end">${d.income}</td></tr>
        <tr><td>Expect. Vida</td><td class="text-end">${d.life_exp}</td></tr>
      </table>
      `
      )
    )
    .on('mouseout', () => hideTooltip())
    .on('mousemove', (e) => moveTooltip(e))
    .transition()
    .duration(325)
    .attr('r', 125)
    .transition()
    .duration(325)
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))

  burbujas
    .merge(burbujas)
    .transition()
    .duration(750)
    .attr('cx', (d) => x(d.income))
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))

  burbujas
    .exit()
    .transition()
    .duration(325)
    .attr('r', 125)
    .attr('fill', '#d00')
    .transition()
    .duration(325)
    .attr('r', 0)
    .remove()
}

function cuadro() {
  data = d3.filter(allData, (d) => d.year == year)
  dibujo(data)
}

function changeYear(inc) {
  console.log(year)
  year += inc
  console.log(year)

  if (year > maxYear) year = maxYear
  if (year < minYear) year = minYear

  txtYear.attr('value', year)
  cuadro()
}

function showTooltip(e, head, body) {
  console.log('mouseenter')
  console.log(d3.pointer(e))

  toolheader.html(head)
  toolbody.html(body)

  moveTooltip(e)

  tooltip.transition().duration(500).style('opacity', 1)
}

function hideTooltip() {
  console.log('mouseout')
  tooltip.transition().duration(500).style('opacity', 0)
}

function moveTooltip(e) {
  der = d3.pointer(e)[0]
  if (der > anchoTotal - margin.right - 200) {
    der -= 200
  }

  tooltip
    .style('left', `${der + margin.left + 15}px`)
    .style('top', `${d3.pointer(e)[1] + margin.top + 15}px`)
}

carga()

// !EVENT LISTENERS PARA EL GUI
txtYear.on('change', () => {
  year = +txtYear.node().value
  // console.log(year)
  cuadro()
})

btnAtras.on('click', () => {
  // year--
  // txtYear.attr('value', year)
  changeYear(-1)
})

btnPlay.on('click', () => {
  corriendo = !corriendo
  if (corriendo) {
    btnPlay.html("<i class='fas fa-pause'></i>")
    btnPlay.classed('btn-danger', true)
    btnPlay.classed('btn-success', false)
    intervalo = d3.interval(() => changeYear(1), 750)
  } else {
    btnPlay.html("<i class='fas fa-play'></i>")
    btnPlay.classed('btn-danger', false)
    btnPlay.classed('btn-success', true)
    intervalo.stop()
  }
})

btnAdelante.on('click', () => {
  // year++
  // txtYear.attr('value', year)
  changeYear(1)
})
