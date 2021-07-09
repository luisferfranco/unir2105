const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

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
  console.log(data)

  allData = data.slice(0, 10)
  console.log(allData)

  render(allData)
})

function render(data) {
  // [binding] ENTER - update - exit
  let barras = g.selectAll('rect').data(data)

  // barras
  //   .enter()
  //   .append('rect')
  //   .attr('x', (d, i) => i*80)
  //   .attr('y', 0)
  //   .attr('width', 70)
  //   .attr('height', d => d.oficial)

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.oficial)])
    .range([alto, 0])

  let x = d3.scaleBand()
    .domain(data.map(d => d.edificio))
    .range([0, ancho])
    .paddingInner(0.2)
    .paddingOuter(0.5)

  let color = d3.scaleOrdinal()
    .domain(d3.map(allData, d => d.region))
    // .range(d3.schemeCategory10)
    .range(['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'])


  const xAxisGroup = g.append('g')
    .attr('transform', `translate(0, ${alto})`)
    .attr('class', 'ejes')
    .call(
      d3.axisBottom(x)
        .tickSize(-alto)
    )
    .selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -15)
    .attr('x', -10)

  const yAxisGroup = g.append('g')
      .attr('class', 'ejes')
      .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-ancho)
          .tickFormat(d => `${d} m.`)
      )

  barras
      .enter()
      .append('rect')
        .attr('x', d => x(d.edificio))
        .attr('y', y(0))
        .attr('width', x.bandwidth())
        .attr('height', alto - y(0))
        .attr('fill', 'black')
      .transition()
      .duration(2000)
      .ease(d3.easeBounce)
        .attr('y', d => y(d.oficial))
        .attr('fill', d => color(d.region))
        .attr('height', d => alto - y(d.oficial))

  titleGroup = g.append('g')
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', ancho/2)
        .attr('y', 45)
        .attr('class', 'titulo')
        .text('Los diez edificios más altos del mundo')
}