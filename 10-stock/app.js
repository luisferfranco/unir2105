const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const tooltip = d3.select('#tooltip')
const toolheader = d3.select('#tooltip-header')
const toolbody = d3.select('#tooltip-body')

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const circle = svg
  .append('circle')
  .attr('cx', anchoTotal / 2)
  .attr('cy', altoTotal / 2)
  .attr('r', altoTotal / 4)
  .attr('fill', '#800')
  .on('mouseenter', (e) => showTooltip(e, 'Israel', 'IPC: 100,000'))
  .on('mouseout', () => hideTooltip())
  .on('mousemove', (e) => moveTooltip(e))

function showTooltip(e, head, body) {
  console.log('mouseenter')
  console.log(d3.pointer(e))

  toolheader.html(head)
  toolbody.html(body)

  tooltip
    .style('left', `${d3.pointer(e)[0] + 15}px`)
    .style('top', `${d3.pointer(e)[1] + 15}px`)
    .transition()
    .duration(500)
    .style('opacity', 1)
}

function hideTooltip() {
  console.log('mouseout')
  tooltip.transition().duration(500).style('opacity', 0)
}

function moveTooltip(e) {
  console.log('mousemove')
  console.log(d3.pointer(e))
  tooltip
    .style('left', `${d3.pointer(e)[0] + 15}px`)
    .style('top', `${d3.pointer(e)[1] + 15}px`)
}
