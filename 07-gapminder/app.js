const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const margin = {
  top: 50,
  bottom: 250,
  left: 150,
  right: 50,
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

// !ESCALADORES
let x = d3.scaleLog().range([0, ancho])
let y = d3.scaleLinear().range([alto, 0])
let r = d3.scaleLinear().range([5, 100])
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
    year = d3.min(datos, (d) => d.year)

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

  burbujas = g.selectAll('circle').data(datos)

  burbujas
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.income))
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))
    .attr('fill-opacity', 0.5)
    .attr('stroke', '#bbb')
}

function cuadro() {
  data = d3.filter(allData, (d) => d.year == year)
  dibujo(data)
}

carga()
