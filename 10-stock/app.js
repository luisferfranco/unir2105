const graf = d3.select('#graf')
const symbol = d3.select('#symbol')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const margin = { top: 20, right: 20, bottom: 70, left: 70 }
const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleTime().range([0, ancho])
const y = d3.scaleLinear().range([alto, 0])
const c = d3
  .scaleOrdinal()
  .domain(['amzn', 'nflx', 'tsla'])
  .range(['#990000', '#009900', '#000099'])
const parser = d3.timeParse('%Y-%m-%d')

const xAxis = g.append('g').attr('transform', `translate(0, ${alto})`)
const yAxis = g.append('g')
const generadorLinea = d3
  .line()
  .x((d) => x(d.Date))
  .y((d) => y(d.Close))
const linea = g.append('path').attr('fill', 'none').attr('stroke-width', 2)

function load(stock = 'amzn') {
  d3.csv(`${stock}.csv`).then((data) => {
    data.forEach((d) => {
      d.Date = parser(d.Date)
      d.Close = +d.Close
    })

    render(data, stock)
  })
}

function render(data, stock = 'amzn') {
  x.domain(d3.extent(data, (d) => d.Date))
  y.domain([
    d3.min(data, (d) => d.Close) * 0.95,
    d3.max(data, (d) => d.Close) * 1.05,
  ])

  xAxis.call(d3.axisBottom().scale(x))
  yAxis.call(d3.axisLeft().scale(y))

  linea.attr('d', generadorLinea(data)).attr('stroke', c(stock))
}

load()

symbol.on('change', () => {
  s = symbol.node().value
  console.log(s)
  load(s)
})
