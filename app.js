// DOM Elements
const langSelect = document.getElementById('langSelect');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadingText = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const resultArea = document.getElementById('resultArea');

const resultImage = document.getElementById('resultImage');
const resultTitle = document.getElementById('resultTitle');
const wikiLink = document.getElementById('wikiLink');
const resultSummary = document.getElementById('resultSummary');
const factsList = document.getElementById('factsList');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const topic = searchInput.value.trim();
  const lang = langSelect.value;
  
  if (!topic) return;

  // Set UI to Loading State
  errorMessage.classList.add('hidden');
  resultArea.classList.add('hidden');
  loadingText.classList.remove('hidden');
  
  const originalBtnText = searchBtn.textContent;
  searchBtn.textContent = 'Searching...';
  searchBtn.disabled = true;

  try {
    const data = await fetchTopicData(topic, lang); 
    
    if (!data) {
      throw new Error(`Could not find information on "${topic}" in the selected language.`);
    }

    renderData(topic, data, lang); 
    
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');
  } finally {
    // Restore UI State
    loadingText.classList.add('hidden');
    searchBtn.textContent = originalBtnText;
    searchBtn.disabled = false;
  }
}

async function fetchTopicData(topic, lang = 'en') {
  // Step 1: Wikipedia API
  const wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  const wikiResponse = await fetch(wikiUrl);
  
  if (!wikiResponse.ok) return null;
  
  const wikiData = await wikiResponse.json();
  const summary = wikiData.extract;
  const thumbnail = wikiData.thumbnail ? wikiData.thumbnail.source : null;
  const qid = wikiData.wikibase_item;

  if (!qid) return { summary, thumbnail, facts: [] };

  // Step 2: Wikidata SPARQL
  const sparqlQuery = `
    SELECT ?propertyLabel ?valueLabel WHERE {
      wd:${qid} ?propUrl ?value .
      ?property wikibase:directClaim ?propUrl .
      FILTER (isIRI(?value))
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
    } LIMIT 5
  `;
  
  const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
  const wikidataResponse = await fetch(wikidataUrl, {
    headers: { 'Accept': 'application/sparql-results+json' }
  });
  
  const wikidataJson = await wikidataResponse.json();
  const facts = wikidataJson.results.bindings.map(b => ({
    property: b.propertyLabel.value,
    value: b.valueLabel.value
  }));

  return { summary, thumbnail, facts, pageId: wikiData.titles.canonical };
}

function renderData(originalTopic, data, lang) {
  // Set Title and Link
  resultTitle.textContent = data.pageId ? data.pageId.replace(/_/g, ' ') : originalTopic;
  wikiLink.href = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.pageId || originalTopic)}`;

  // Set Summary
  resultSummary.textContent = data.summary;

  // Set Image
  if (data.thumbnail) {
    resultImage.src = data.thumbnail;
    resultImage.style.display = 'block';
  } else {
    resultImage.style.display = 'none';
  }

  // Set Facts
  factsList.innerHTML = ''; 
  if (data.facts && data.facts.length > 0) {
    data.facts.forEach(fact => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${fact.property}</strong> <span>${fact.value}</span>`;
      factsList.appendChild(li);
    });
  } else {
    factsList.innerHTML = '<li>No quick facts available.</li>';
  }

  // Show the card
  resultArea.classList.remove('hidden');
}
