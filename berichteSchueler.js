function addMissingsDetailsChkBox() {
  // const tblMissings = document.querySelector('#tblMissing');
  const lstGroupItem = document.querySelectorAll('.list-group-item')[1];
  // console.log(lstGroupItem);

  const divSwMissingDetails = document.createElement('div');
  divSwMissingDetails.classList.add('custom-control', 'custom-switch');
  divSwMissingDetails.innerHTML =
    '<input type="checkbox" class="custom-control-input data-visible-parts" id="swMissingsDetails"><label class="custom-control-label" for="swMissingsDetails">Details</label>';
  // divSwMissingDetails.querySelector('input').setAttribute('id','swMissingDetails');
  lstGroupItem.appendChild(divSwMissingDetails);

  divSwMissingDetails.addEventListener('change', () => {
    // tblMissings.classList.toggle('hidden');
    divMissings.classList.toggle('hidden');
  });
}

function disableChkBoxes() {
  const swMemos = document.querySelector('#swMemos');
  const swMarks = document.querySelector('#swMarks');
  const swMissings = document.querySelector('#swMissings');
  const swMissingsDetails = document.querySelector('#swMissingsDetails');

  const interval = setInterval(() => {
    const tblMarks = document.querySelector('#tblMarks');
    const tblMemos = document.querySelector('#tblMemos');
    const tblMissingsSummery = document.querySelector(
      '#tblMissingsSummary colgroup'
    );

    if (tblMarks && tblMemos && tblMissingsSummery) {
      clearInterval(interval);
      swMarks.click();
      swMemos.click();
      // console.log('clearInterval');
      tblMissingsSummery.remove();
      swMarks.setAttribute('accesskey', 'n');
      swMemos.setAttribute('accesskey', 'b');
      swMissings.setAttribute('accesskey', 'f');
      swMissingsDetails.setAttribute('accesskey', 'd');

      swMarks.addEventListener('change', () => {
        if (tblMarks.parentElement.style.display == 'none') {
          // console.log('hidden');
          sessionStorage.removeItem('Marks');
        } else {
          sessionStorage.setItem('Marks', 'true');
        }
      });

      swMissings.addEventListener('change', () => {
        if (tblMissings.parentElement.parentElement.style.display == 'none') {
          // console.log('hidden');
          sessionStorage.removeItem('Missings');
          if (swMissingsDetails.checked) {
            swMissingsDetails.click();
          }
        } else {
          sessionStorage.setItem('Missings', 'true');
        }
      });

      swMissingsDetails.addEventListener('change', () => {
        if (swMissingsDetails.checked) {
          if (tblMissings.parentElement.parentElement.style.display == 'none') {
            swMissings.click();
          }
        }
      });

      document
        .querySelector('#swMissingsDetails')
        .addEventListener('change', () => {
          // if(!tblMissings.classList.contains('hidden')){
          if (!divMissings.classList.contains('hidden')) {
            sessionStorage.removeItem('MissingDetails');
          } else {
            sessionStorage.setItem('MissingDetails', 'true');
          }
        });

      if (sessionStorage.getItem('Marks') == 'true') {
        swMarks.click();
      }

      if (sessionStorage.getItem('Missings') !== 'true') {
        swMissings.click();
      }

      if (sessionStorage.getItem('MissingDetails') == 'true') {
        document.querySelector('#swMissingsDetails').click();
      }
    }
  }, 100);
}

function cleanUpMissingTable() {
  const tblMissings = document.querySelector('#tblMissings tbody');
  const trs = tblMissings.querySelectorAll('tr');

  trs.forEach((tr) => {
    tr.classList.remove('hidden');
  });

  let day = '';
  for (let i = 0; i < trs.length; ++i) {
    if (trs[i].cells[2].classList.contains('missing-d')) {
      day = trs[i].cells[0].textContent;
      console.log(day);
    }

    trs.forEach((tr, index) => {
      if (i != index && tr.cells[0].textContent === day) {
        tr.classList.add('hidden');
      }
    });

    day = '';
  }
}

function createContainerAroundTableMissings() {
  const divMissings = document.createElement('div');
  divMissings.setAttribute('id', 'divMissings');
  tblMissings.parentElement.insertBefore(divMissings, tblMissings);
  // tblMissings.parentElement.removeChild(tblMissings);
  divMissings.appendChild(tblMissings);
}

function init() {
  const tblMissings = document.querySelector('#tblMissings');
  if (tblMissings) {
    observer.disconnect();
    createContainerAroundTableMissings();

    addMissingsDetailsChkBox();
    disableChkBoxes();
    // console.log('tblMissings');
    // tblMissings.classList.add('hidden');
    divMissings.classList.add('hidden');

    observer = new MutationObserver(cleanUpMissingTable);
    observer.observe(tblMissings.querySelector('tbody'), { childList: true });
  }
}

let observer = new MutationObserver(init);
observer.observe(document.querySelector('body'), {
  childList: true,
  subtree: true,
});
