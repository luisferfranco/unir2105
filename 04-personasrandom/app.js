const busqueda = d3.select('#busqueda')
const personas = d3.select('#personas')
const api = 'https://randomuser.me/api/?results=20'
let gente = []

function load() {
  d3.json(api).then((data) => {
    console.log(data)
    gente = data.results
    render(gente)
  })
}

function render(gente) {
  personas.text('')

  gente.forEach((p) => {
    personas.append('div').attr('class', 'mt-4 mb-4 d-flex').html(`
    <div class="flex-shrink-0">
      <img
        src="${p.picture.medium}"
        alt="..."
        class="rounded-circle avatar"
      />
    </div>
    <div class="flex-grow-1 ms-3 user-info">
      <div class="nombre">
        <h3>${p.name.title + '. ' + p.name.first + ' ' + p.name.last}</h3>
      </div>
      <div class="ubicacion">${
        p.location.city + ', ' + p.location.country
      }</div>
    </div>
    `)
  })
}

function filtro() {
  const f = busqueda.node().value

  const data = d3.filter(gente, (p) =>
    p.location.country.toLowerCase().includes(f.toLowerCase())
  )
  render(data)
}

load()
