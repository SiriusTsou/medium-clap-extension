var OPTIONS = {
  'clap': 1,
  'clapclap': 10,
  'clapclapclap': 50,
}

function escapeHtml(html){
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

function selectOption(option) {
  // Curry function with option
  return function(e){
    chrome.storage.sync.set({
      'clapOption': option
    });

    chrome.tabs.query({active: true, currentWindow: true, url: ['https://medium.com/*', 'https://*.medium.com/*']}, function(tabs) {
      if (tabs.length) {
        for (tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {data: OPTIONS[option]}, function(response) {
            console.log('success');
          });
        }
      }
    });      

    updateDom();
    addClickListeners();
  };
}

function updateDom() {
  function renderDom() {
    let html = 
    `<div class="claps js-claps" data-option="clap">
      <span class="claps-number" data-option="clap">1</span>
      <span class="claps-label">哈嘍</span>
    </div>`+
    `<div class="claps js-claps" data-option="clapclap">
      <span class="claps-number">10</span>
      <span class="claps-label">在哈嘍</span>
    </div>`+
    `<div class="claps js-claps" data-option="clapclapclap">
      <span class="claps-number">50</span>
      <span class="claps-label">是在哈嘍</span>
    </div>`;

    // Update dom
    document.getElementsByClassName('js-popup')[0].innerHTML = html;
    addClickListeners();

    // Show selected option
    chrome.storage.sync.get({
      'clapOption': 'clap'
    }, (items)=>{
      let element = document.querySelectorAll(`div[data-option='${items.clapOption}']`)[0];
      element.className += ' selected';
    });
  }

  renderDom()
}

function addClickListeners() {
  // Add click listeners
  let elements = document.getElementsByClassName('js-claps');
  for(let i=0; i<elements.length; i++) {
    const element = elements[i];
    // Select option when clicked
    element.addEventListener('click', selectOption(element.dataset.option));
  }
}

function start() {
  updateDom();
}

start();