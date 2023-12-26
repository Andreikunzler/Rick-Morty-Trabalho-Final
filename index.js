function speciesTranslateName(species){

  const speciesTranslated = {
    "Human": "Humano",
    "Alien": "Alienígena",
    "Humanoid": "Humanóide",
    "Unknown": "Desconhecido",
    "Poopybutthole": "Sr. Poopybutthole",
    "Mythological Creature": "Criatura Mítica",
    "Animal": "Animal",
    "Robot": "Robô",
    "Cronenberg": "Cronenberg",
    "Disease": "Doença",
  };
  
  return speciesTranslated[species] || "Não Definido";
}

function statusTranslate(status) {
  const statusTranslated = {
    "Alive": "Vivo",
    "Dead": "Morto",
    "unknown": "Desconhecido"
  }

  return statusTranslated[status] || "Não Definido";
}
const filterContainer = document.querySelector(".containerFilter");
const charactersCountElement = document.querySelector("[data-count-characters]");
const locationsCountElement = document.querySelector("[data-count-locations]");
const episodesCountElement = document.querySelector("[data-count-episodes]");

const charactersURL = "https://rickandmortyapi.com/api/character/?page=1";
const episodesURL = "https://rickandmortyapi.com/api/episode";
const locationsURL = "https://rickandmortyapi.com/api/location";


async function dataApiLoader(page = 1) {
  const characters = await axios.get(`${charactersURL}`)
  const episodes = await axios.get(`${episodesURL}/?page=${page}`)
  const locations = await axios.get(`${locationsURL}/?page=${page}`)

  return {
    characters: characters.data,
    episodes: episodes.data,
    locations: locations.data
  }
}

filter.addEventListener('focus', () => {
  filterContainer.classList.add('focused');
}) 

filter.addEventListener('blur', () => {
  filterContainer.classList.remove('focused');
}) 

function mountCard(image, name, status, species, location, episode) {
  return `
  <article class="card">
  <img class="imageCharacter" src="${image}" alt="Character image">
  <div class="infoCharacter">
      <div>
          <h2>${name}</h2>
          <h3><span class="status ${status}"></span>${statusTranslate(status)} - ${speciesTranslateName(species)}</h3>
      </div>
      <div>
          <p><strong>Última localização conhecida:<strong></p>
          <h3>${location.name}</h3>
      </div>
      <div>
          <p><strong>Visto a última vez em:<strong></p>
          <h3>${episode}</h3>
      </div>
  </div>
</article>
  `;
}

async function lastseenFetchEpisode(episodes) {
  return (await axios.get(episodes[episodes.length - 1]));
}

async function charactersbyFetchPage(url){
  try {
    const response = await axios.get(url);
    const characters = response.data.results;

    pagecontextChangeData(
      response.data.info.pages, 
      response.data.info.prev, 
      response.data.info.next
    );
    pagestoChangeShow()
    
    container.innerHTML = ""
    characters.forEach( async ({name, status, location, image, episode, species}) => {
      const episodeName = (await lastseenFetchEpisode(episode)).data.name;
      container.innerHTML += mountCard(image, name, status, species, location, episodeName);
    });
  } catch(error) {
    console.log(error);
    alert("Não foi possível buscar personagens");
  }
}
charactersbyFetchPage(charactersURL);

async function charactersbyGetName(name) {
  return await axios.get(`https://rickandmortyapi.com/api/character/?name=${name}`);
}

filter.addEventListener('keyup', async e => {
  container.innerHTML = '<div class="loader"></div>';
  const filteredCharacters = (await charactersbyGetName(e.target.value)).data.results;
// TODO: erro se não achou nome
  setTimeout(()=> {
    container.innerHTML = '';
    filteredCharacters.forEach( async ({name, status, location, image, episode, species}) => {
      const episodeName = (await lastseenFetchEpisode(episode)).data.name;
      container.innerHTML += mountCard(image, name, status, species, location, episodeName);
    });
  }, 300);
}); 

async function dataGetCount(data) {
  const res = await dataApiLoader()
    return res[data].info.count;
}

async function apienpointsinfoPrintAmount() {
  charactersCountElement.textContent = await dataGetCount('characters');
  locationsCountElement.textContent = await dataGetCount('locations');
  episodesCountElement.textContent = await dataGetCount('episodes');
}

let pageContext = {
  currentPage: 1,
  totalPages: 0,
  previousPage: null,
  nextPage: null,
  pagesToShow: [],
  setCurrentPage () {
    if(!this.previousPage) {
      this.currentPage = 1;
      return;
    }
    if(!this.nextPage) {
      this.currentPage = this.totalPages;
      return;
    } 
    const indexPrev = this.previousPage.indexOf("=");
    const numberOfNextPage = Number(this.previousPage.slice(indexPrev +1));

    this.currentPage = numberOfNextPage + 1
  }
}

function pagecontextChangeData(total, previous, next) {
  pageContext.totalPages = total;
  pageContext.previousPage = previous;
  pageContext.nextPage = next;
  pageContext.setCurrentPage();
}

function pagestoChangeShow() {
  if(pageContext.currentPage <= pageContext.totalPages){
    pageContext.pagesToShow = [];

    let keepLooping = true 
    let number = 1
    while(keepLooping) {
      let multiple = number * 10;
      if(multiple > pageContext.currentPage) {
        keepLooping = false;
        number = multiple;
        continue;
      }
      number++;
    }

    while(pageContext.pagesToShow.length < 11 && pageContext.pagesToShow[pageContext.pagesToShow.length - 1] !== pageContext.totalPages) {
      if(pageContext.pagesToShow.length) {
        const num = pageContext.pagesToShow[0] - 1;
          pageContext.pagesToShow.unshift(num);
      } else {
        pageContext.pagesToShow.push(number);
      }
    }
    if(pageContext.pagesToShow.includes(0)) {
      pageContext.pagesToShow.shift()
    }
    if(pageContext.pagesToShow.some(num => num > pageContext.totalPages)){
      pageContext.pagesToShow = pageContext.pagesToShow
        .filter(num => num <= pageContext.totalPages);
    }
    return;
  }
}
function getPreviousPage(){
  if(pageContext.previousPage) {
    charactersbyFetchPage(pageContext.previousPage);
  }
}

function getNextPage(){
  if(pageContext.nextPage) {
    charactersbyFetchPage(pageContext.nextPage);
  }
}

function getSpecificPage(e) {
  const page = e.target.value;
  charactersbyFetchPage(`https://rickandmortyapi.com/api/character/?page=${page}`);
}