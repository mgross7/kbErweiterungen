let today = new Date();

let user = {};

// date = {
// 	year : date.getFullYear(),
// 	month : (date.getMonth()+1),
// 	day : date.getDate()
// }

let date = today;

let btnDatums = [];

async function getVPlan(date) {
  let datum = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // console.log(`${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`);
  // console.log(datum);
  let data = await fetch(`php/getPlanData.php?datum=${datum}`);
  let daten = await data.json();
  // writeForm(daten);
  // labelDate = dayNames[date.getDay()];
  let monat = (date.getMonth() + 1).toString().padStart(2, '0');
  let tag = date.getDate().toString().padStart(2, '0');
  // console.log(`${dayNames[date.getDay()]}, ${tag}.${monat}.${date.getFullYear()}`);
  // console.log(`${dayNames[date.getDay()]}, ${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`);
  labelDate = `${
    dayNames[date.getDay()]
  }, ${tag}.${monat}.${date.getFullYear()}`;
  writeTableVertretungen(daten);
  // console.log(daten);
}

function getNextPlan(date) {}

function removeClassCHidden(element) {
  const trs = element.querySelectorAll('tr');
  // console.log(trs);

  trs.forEach((tr, index) => {
    // console.log(tr);
    if (index > 2) {
      tr.classList.remove('c-hidden');
    }
  });
}

function getRegExp(filter) {
  return new RegExp(filter, 'i');
}

function hideEntries(element, re) {
  const tds = element.querySelectorAll('td:first-child');
  // console.log(tds);
  let display = true;

  tds.forEach((td, index) => {
    if (
      index > 2 &&
      td.textContent.length > 1 &&
      td.textContent.search(re) === -1
    ) {
      display = false;
    } else if (
      (index > 2 && td.textContent.length > 1) ||
      td.classList.contains('headers')
    ) {
      display = true;
    }

    if (index > 2 && td.classList.contains('headers')) {
      display = true;
    }

    if (!display) {
      td.parentElement.classList.add('c-hidden');
    }
  });
}

async function filterTable(filter) {
  // console.log(filter);
  const tableVertretungen = document.querySelector('#tableVertretungen');
  removeClassCHidden(tableVertretungen);
  re = getRegExp(filter);
  // console.log(re);
  hideEntries(tableVertretungen, re);
}

async function getUser() {
  const res = await fetch(
    `https://www.sbsz-hsp.de/sdb/getPlan/php/getPlanData.php?datum=${saveDate}`
  );
  user = await res.json();
  user = user.user[0];
}

async function createInputFilter(beforeElement) {
  const inputFilter = document.createElement('input');
  inputFilter.setAttribute('id', 'inputFilter');
  inputFilter.setAttribute('type', 'text');
  inputFilter.setAttribute('placeholder', 'Klassenfilter');

  let filter = window.localStorage.getItem(`bszh-vp-${user.aName}`);
  if (filter) {
    filter = JSON.parse(filter).filter;
    console.log(filter);
    inputFilter.value = `${filter}`;
    console.log(filter);
  }

  beforeElement.parentElement.insertBefore(inputFilter, beforeElement);
  inputFilter.addEventListener('input', () => {
    filterTable(inputFilter.value);
    // console.log(inputFilter.value);
    if (inputFilter.value.length > 0) {
      window.localStorage.setItem(
        `bszh-vp-${user.aName}`,
        JSON.stringify({ filter: inputFilter.value })
      );
    } else {
      window.localStorage.removeItem(`bszh-vp-${user.aName}`);
    }
  });
}

async function updateData() {
  // console.log('updateData');
  // const inputFilter = document.querySelector('#inputFilter');
  // if(inputFilter){
  // 	inputFilter.textContent = `${user}`;
  // }
  filterTable(document.querySelector('#inputFilter')?.value);
}

async function changeObserver(observer, elementToObserve) {
  observer.disconnect();
  observer = new MutationObserver(updateData);
  observer.observe(elementToObserve, { childList: true, subtree: true });
}

function existsVertretungsplan() {
  const tableVertretungen = document.querySelector('#tableVertretungen');
  if (tableVertretungen) {
    // console.log(tableVertretungen);
    changeObserver(observer, tableVertretungen);
    createInputFilter(tableVertretungen);
    updateData();

    //Datum anpassen wenn auf Datumsschaltflächen geclickt wird!
    let btnDatums = document.querySelectorAll('.btnDatum span');
    // console.log(btnDatums[0].textContent);

    btnDatums.forEach((btn) => {
      // console.log(btn.textContent);
      btn.addEventListener('click', (e) => {
        let btnDateText = btn.textContent.split(', ')[1].split('.');
        date.setDate(btnDateText[0]);
        date.setMonth(btnDateText[1] - 1);
        date.setFullYear(btnDateText[2]);
      });
    });

    // let inpDataPicker = document.querySelector('#datepickerVon');
    // let dataPick = document.querySelector('#ui-datepicker-div');

    // dataPick.addEventListener('click', (e) => {
    // 	console.log(inpDataPicker.value);
    // });

    // inpDataPicker.addEventListener('blur', (e) => {
    // 	let dpDate = e.target.value;
    // 	// let dpDate = this.value;
    // 	console.log(dpDate);
    // })
  }
}

// chrome.storage.local.get(['active'], (values) => {
//   alert(value);
//   //   // if (values.active) chkActive.checked = values.active;
//   //   // chkActive.checked = values.active ?? true;
// });

let observer = new MutationObserver(existsVertretungsplan);
observer.observe(document.querySelector('body'), { childList: true });

addEventListener('load', (event) => {
  // console.log(date);
});

function changeSaveDate(date) {
  saveDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

document.addEventListener('keydown', (keyEvent) => {
  const inputs = Array.from(document.querySelectorAll('input'));

  // console.log(inputs);
  if (saveDate) {
    let sd = saveDate.split('-');
    date.setDate(sd[2]);
    date.setMonth(sd[1] - 1);
    date.setFullYear(sd[0]);
  }

  if (keyEvent.ctrlKey) {
    // console.log('control');
    switch (keyEvent.key) {
      case 'ArrowLeft':
        // console.log('ArrowLeft');
        if (keyEvent.shiftKey) {
          date.setMonth(date.getMonth() - 1);
        } else {
          date.setDate(date.getDate() - 1);
        }
        // console.log(date.getDay());
        while (date.getDay() == 6 || date.getDay() == 0) {
          date.setDate(date.getDate() - 1);
        }
        changeSaveDate(date);
        getVPlan(date);
        break;

      case 'ArrowRight':
        // console.log('ArrowRight');
        if (keyEvent.shiftKey) {
          date.setMonth(date.getMonth() + 1);
        } else {
          date.setDate(date.getDate() + 1);
        }
        while (date.getDay() == 6 || date.getDay() == 0) {
          date.setDate(date.getDate() + 1);
        }
        changeSaveDate(date);
        getVPlan(date);
        break;

      case 'ArrowDown':
        // console.log('ArrowRight');
        // let datum = new Date(Date.now());
        let datum = new Date(Date.now());
        // console.log(datum);
        // console.log(`${datum.getUTCDate()}.${datum.getUTCMonth()+1}.${datum.getUTCFullYear()}`);
        // console.log(date.getDate());
        // date.setDate(`${datum.getUTCDate()}.${datum.getUTCMonth()+1}.${datum.getUTCFullYear()}`);
        date.setDate(datum.getUTCDate());
        date.setMonth(datum.getUTCMonth());
        date.setFullYear(datum.getUTCFullYear());
        while (date.getDay() == 6 || date.getDay() == 0) {
          date.setDate(date.getDate() + 1);
        }
        changeSaveDate(date);
        getVPlan(date);
        break;
    }
  }
});

// getUser();
