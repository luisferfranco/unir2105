// Selectores de los elementos de GUI
// tanto interacción como despliegue
const graf = d3.select('#graf')
const tooltip = d3.select('#tooltip')
const toolheader = d3.select('#tooltip-header')
const toolbody = d3.select('#tooltip-body')
const paisNombre = d3.select('#pais-nombre')
const paisInfo = d3.select('#pais-info')
const bandera = d3.select('#bandera')
const selContinente = d3.select('#select-continent')
const txtYear = d3.select('#txt-year')
const btnAtras = d3.select('#btn-atras')
const btnPlay = d3.select('#btn-play')
const btnAdelante = d3.select('#btn-adelante')
// Otras gráficas y sus títulos
const graf1 = d3.select('#graf1')
const titg1 = d3.select('#titg1')
const graf2 = d3.select('#graf2')
const titg2 = d3.select('#titg2')

// Constantes de la gráfica principal
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
  left: 25,
  right: 30,
}
const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
const yearDisplay = g
  .append('text')
  .attr('class', 'numerote')
  .attr('x', ancho / 2)
  .attr('y', alto / 2 + 50)
  .attr('text-anchor', 'middle')

// El tamaño de las gráficas secundarias
// es el mismo, por lo que podemos usar
// las mismas constantes para ambas
const anchoTot6 = graf1.style('width').slice(0, -2)
const altoTot6 = (anchoTot6 * 9) / 16
const margin6 = {
  top: 10,
  bottom: 25,
  left: 155,
  right: 10,
}
const ancho6 = anchoTot6 - margin6.left - margin6.right
const alto6 = altoTot6 - margin6.top - margin6.bottom
const svg1 = graf1
  .append('svg')
  .attr('width', anchoTot6)
  .attr('height', altoTot6)
  .attr('class', 'graf')
const g1 = svg1
  .append('g')
  .attr('transform', `translate(${margin6.left}, ${margin6.top})`)
const svg2 = graf2
  .append('svg')
  .attr('width', anchoTot6)
  .attr('height', altoTot6)
  .attr('class', 'graf')
const g2 = svg2
  .append('g')
  .attr('transform', `translate(${margin6.left}, ${margin6.top})`)
  .attr('opacity', 0)

// !VARIABLES GLOBALES
let allData = []
let year = 0
let minYear, maxYear
let corriendo = false
let intervalo
let pais = ''

// !ESCALADORES
// Escaladores para la gráfica principal
let x = d3.scaleLog().range([0, ancho])
let y = d3.scaleLinear().range([alto, 0])
let r = d3.scaleLinear().range([15, 150])
let color = d3
  .scaleOrdinal()
  .range(['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'])

// Escaladores para la gráfica 1
// Evolución del GDP per cápita
let x1 = d3.scaleLinear().range([0, ancho6])
let y1 = d3.scaleLinear().range([alto6, 0])
const xAxis1 = g1.append('g').attr('transform', `translate(0, ${alto6})`)
const yAxis1 = g1.append('g')
// Generador de líneas para la gráfica 1
const lineaGen1 = d3
  .line()
  .x((d) => x1(d.year))
  .y((d) => y1(d.income))
const linea1 = g1.append('path').attr('fill', 'none').attr('stroke-width', 3)

// Escaladores para la gráfica 2
// Evolución del GDP total por regiones
let x2 = d3.scaleBand().range([0, ancho6]).paddingInner(0.2)
let y2 = d3.scaleLinear().range([alto6, 0])
const xAxis2 = g2.append('g').attr('transform', `translate(0, ${alto6})`)
const yAxis2 = g2.append('g')

function carga() {
  d3.csv('gap.csv').then((datos) => {
    datos.forEach((d) => {
      d.income = +d.income
      d.life_exp = +d.life_exp
      d.population = +d.population
      d.year = +d.year

      // Añadimos una columna nueva para
      // calcular el GDP total de cada país
      d['gdp'] = d.income * d.population
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

    // Usamos una función de reduce() para calcular
    // el GDP de una región
    //
    // La función reduce() sirve para aplicar una
    // función sobre un arreglo. En este caso la
    // estamos usando para crear un arreglo que
    // contiene el GDP de un continente (suma de todos
    // los países que lo conforman)
    //
    // Lo solicitamos del año más reciente, porque asumo
    // que es el año con el PIB más alto
    var result = []
    d3.filter(datos, (d) => d.year == maxYear).reduce((res, value) => {
      if (!res[value.continent]) {
        res[value.continent] = {
          continent: value.continent,
          gdp: 0,
        }
        result.push(res[value.continent])
      }
      res[value.continent].gdp += value.gdp
      return res
    }, {})

    x2.domain(d3.map(result, (d) => d.continent))
    y2.domain([0, d3.max(result, (d) => d.gdp)])

    // Este es poco claro, pero ya que estamos
    // cargando los continentes en el dominio del
    // x2, aprovechamos para llenar el select de
    // continentes con ese arreglo
    x2.domain().forEach((d) => {
      selContinente.append('option').attr('value', d).text(d)
    })

    // !EJES DE LAS GRÁFICAS
    // La gráfica principal y la gráfica 2
    // no cambian la escala de las Y, por lo
    // que podemos dibujarlas de una vez
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

    g2.append('g')
      .attr('transform', `translate(0, ${alto6})`)
      .call(d3.axisBottom(x2))
    g2.append('g').call(d3.axisLeft(y2).ticks(10).tickSize(-ancho6))

    cuadro()
  })
}

// Sin cambio contra gapminder
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
    .on('click', (e, d) => selectPais(e, d))
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
    .attr('cx', (d) => {
      if (d.country == pais) {
        moveTooltip(d)
      }
      return x(d.income)
    })
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))
    .attr('stroke-width', (d) => {
      if (d.country == pais) {
        return 3
      } else {
        return 1
      }
    })
    .attr('stroke', (d) => {
      if (d.country == pais) {
        return '#c00'
      } else {
        return '#bbb'
      }
    })

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

// Gráfica sobre la evolución del GDP per
// cápita en el país
function render1(data) {
  x1.domain(d3.extent(data, (d) => d.year))
  y1.domain([
    d3.min(data, (d) => d.income) * 0.95,
    d3.max(data, (d) => d.income) * 1.05,
  ])

  xAxis1.call(d3.axisBottom().scale(x1))
  yAxis1.transition().duration(500).call(d3.axisLeft().ticks(10).scale(y1))
  linea1
    .transition()
    .duration(500)
    .attr('stroke', 'red')
    .attr('d', lineaGen1(data))
}

// Gráfica sobre el GDP por región
function render2(data) {
  // Obtenemos la región a la que pertenece
  // el país seleccionado
  continente = d3.filter(data, (d) => d.country == pais)
  // console.log(continente[0].continent)
  continente = continente[0].continent

  var result = []
  data.reduce((res, value) => {
    if (!res[value.continent]) {
      res[value.continent] = { continent: value.continent, gdp: 0 }
      result.push(res[value.continent])
    }
    res[value.continent].gdp += value.gdp
    return res
  }, {})

  bars = g2.selectAll('rect').data(result, (d) => d.continent)
  bars
    .enter()
    .append('rect')
    .attr('x', (d) => x2(d.continent))
    .attr('y', y2(0))
    .attr('width', x2.bandwidth())
    .merge(bars)
    .transition()
    .duration(500)
    .attr('width', x2.bandwidth())
    .attr('x', (d) => x2(d.continent))
    .attr('y', (d) => y2(d.gdp))
    .attr('height', (d) => alto6 - y2(d.gdp))
    .attr('fill', (d) => (d.continent == continente ? '#c00' : '#00c'))
}

function cuadro() {
  data = d3.filter(allData, (d) => d.year == year)
  cont = selContinente.node().value
  if (cont != 'todos') {
    data = d3.filter(data, (d) => d.continent == cont)
  }
  dibujo(data)

  // Si hay un país seleccionado, entonces se
  // redibuja la gráfica de barras
  if (pais !== '') {
    render2(data)
  }
}

function changeYear(inc) {
  year += inc

  if (year > maxYear) year = maxYear
  if (year < minYear) year = minYear

  txtYear.attr('value', year)
  cuadro()
}

function showTooltip(d) {
  toolheader.html(d.country)
  toolbody.html(
    `
    <table>
      <tr><td>Población</td><td class="text-end">${d.population}</td></tr>
      <tr><td>PIB Per Cápita</td><td class="text-end">${d.income}</td></tr>
      <tr><td>Expect. Vida</td><td class="text-end">${d.life_exp}</td></tr>
    </table>
    `
  )

  posx = x(d.income)
  posy = y(d.life_exp)
  tooltip
    .style('left', `${posx + margin.left + 12}px`)
    .style('top', `${posy + margin.top}px`)
  moveTooltip(d)
}

function moveTooltip(d) {
  posx = x(d.income)
  posy = y(d.life_exp)
  toolbody.html(
    `
    <table>
      <tr><td>Población</td><td class="text-end">${d.population.toLocaleString(
        'en-US'
      )}</td></tr>
      <tr><td>PIB Per Cápita</td><td class="text-end">${d.income.toLocaleString(
        'en-US'
      )}</td></tr>
      <tr><td>Expect. Vida</td><td class="text-end">${d.life_exp}</td></tr>
    </table>
    `
  )

  if (posx > anchoTotal - margin.right - 200) {
    posx -= 200
  }

  tooltip
    .transition()
    .duration(500)
    .style('left', `${posx + margin.left + 12}px`)
    .style('top', `${posy + margin.top}px`)
    .style('opacity', 1)
}

// Cambio
function selectPais(e, d) {
  paisNombre.html(d.country)
  pais = d.country

  // Carga de la información del país
  bandera.attr(
    'src',
    `https://restcountries.eu/data/${d.alpha_3.toLowerCase()}.svg`
  )

  d3.json(
    `http://api.worldbank.org/v2/country/${d.alpha_2.toLowerCase()}?format=json`
  ).then((data) => {
    info = data[1][0]
    paisInfo.html(`
    <table class="table table-hover mt-4 table-stripped">
      <tr><td>Capital</td><td>${info.capitalCity}</td></tr>
      <tr><td>Region</td><td>${info.region.value}</td></tr>
      <tr><td>Admin. Region</td><td>${info.adminregion.value}</td></tr>
      <tr><td>Income Level</td><td>${info.incomeLevel.value}</td></tr>
      <tr><td>Longitud</td><td>${info.longitude}</td></tr>
      <tr><td>Latitude</td><td>${info.latitude}</td></tr>
    </table>
    `)
  })

  // Se despliegan las gráficas cambiando la opacidad
  // Se despliegan las gráficas
  titg1.transition().duration(500).style('opacity', 1)
  g1.transition().duration(500).attr('opacity', 1)
  titg2.transition().duration(500).style('opacity', 1)
  g2.transition().duration(500).attr('opacity', 1)
  render1(d3.filter(allData, (d) => d.country == pais))
  render2(d3.filter(allData, (d) => d.year == year))

  showTooltip(d)
}

carga()

// !EVENT LISTENERS PARA EL GUI
txtYear.on('change', () => {
  year = +txtYear.node().value
  cuadro()
})

btnAtras.on('click', () => {
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
  changeYear(1)
})

// El nuevo tooltip se cierra cuando
// se presiona en el mismo
tooltip.on('click', () => {
  pais = ''

  paisNombre.html('Ningún país seleccionado')
  paisInfo.html('')
  bandera.attr('src', '')

  // Se esconden las gráficas y tooltip
  // cambiando la opacidad
  titg1.transition().duration(500).style('opacity', 0)
  titg2.transition().duration(500).style('opacity', 0)
  g1.transition().duration(500).attr('opacity', 0)
  g2.transition().duration(500).attr('opacity', 0)

  tooltip.transition().duration(500).style('opacity', 0)
})

selContinente.on('change', () => {
  cuadro()
})
