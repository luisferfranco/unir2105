const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

// ids de HTML
const selectVar = d3.select('#variable')
const selectNum = d3.select('#numero')

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

// svg.append('rect')
//   .attr('x', 0)
//   .attr('y', 0)
//   .attr('width', anchoTotal)
//   .attr('height', altoTotal)
//   .attr('stroke', '#c00')
//   .attr('stroke-width', 5)
//   .attr('fill', 'none')

const margin = {
  top: 50,
  bottom: 250,
  left: 150,
  right: 50,
}

const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// g.append('circle')
//   .attr('cx', 0)
//   .attr('cy', 0)
//   .attr('r', 100)

// g.append('rect')
//   .attr('x', 0)
//   .attr('y', 0)
//   .attr('width', ancho)
//   .attr('height', alto)
//   .attr('stroke', '#777')
//   .attr('stroke-width', 2)
//   .attr('fill', 'none')

let allData = []
let txtVariable = 'oficial'
let numRegistros = 10

let y = d3.scaleLinear()
  .range([alto, 0])

let x = d3.scaleBand()
  .range([0, ancho])
  .paddingInner(0.2)
  .paddingOuter(0.5)

let color = d3.scaleOrdinal()
  .range(['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'])

const xAxisGroup = g.append('g')
  .attr('transform', `translate(0, ${alto})`)
  .attr('class', 'ejes')

const yAxisGroup = g.append('g')
    .attr('class', 'ejes')


d3.csv('edificios.csv').then(data => {
  data.forEach(d => {
    // console.log(d.edificio)
    d.ano = +d.ano
    d.antena = +d.antena
    d.oficial = +d.oficial
    d.piso = +d.piso
    d.puesto = +d.puesto
    d.ultimopiso = +d.ultimopiso
  })

  allData = data

  render(allData.slice(0, numRegistros))
})

function render(data) {
  // [binding] ENTER - update - exit
  let barras = g.selectAll('rect').data(data)

  y.domain([0, d3.max(data, d => d[txtVariable])])
  x.domain(data.map(d => d.edificio))
  color.domain(d3.map(allData, d => d.region))

  xAxisGroup
    .transition()
    .duration(2000)
    .call(
      d3.axisBottom(x)
        .tickSize(-alto)
    )
    .selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -15)
    .attr('x', -10)

  yAxisGroup
    .transition()
    .duration(2000)
    .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-ancho)
          .tickFormat(d => `${d} ${ txtVariable == 'piso' ? 'pisos' : 'm.' }`)
      )

  barras
      .enter()
        .append('rect')
          .attr('y', y(0))
          .attr('x', d => x(d.edificio))
          .attr('width', x.bandwidth())
          .attr('height', alto - y(0))
          .attr('fill', 'green')
      .merge(barras)
        .transition()
        .duration(2000)
        .ease(d3.easeBounce)
          .attr('x', d => x(d.edificio))
          .attr('width', x.bandwidth())
          .attr('y', d => {
            console.log(txtVariable)
            return y(d[txtVariable])
          })
          .attr('fill', d => color(d.region))
          .attr('height', d => alto - y(d[txtVariable]))

  barras.exit()
          .transition()
          .duration(2000)
          .attr('height', alto - y(0))
          .attr('y', y(0))
          .attr('fill', '#f00')
          .remove()

  // titleGroup = g.append('g')
  //       .append('text')
  //       .attr('text-anchor', 'middle')
  //       .attr('x', ancho/2)
  //       .attr('y', 45)
  //       .attr('class', 'titulo')
  //       .text('Los diez edificios más altos del mundo')
}

selectVar.on('change', () => {
  txtVariable = selectVar.node().value
  render(allData)
})

selectNum.on('change', () => {
  numRegistros = selectNum.node().value
  render(allData.slice(0, numRegistros))
})