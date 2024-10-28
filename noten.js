const pupilsList = document.createElement('select');
pupilsList.setAttribute('id', 'pupilsList');
// pupilsList.setAttribute('multiple', 'multiple');
let selPupil = '';

function selectPupil() {
  const markTables = document.querySelectorAll('.scroller-v table:first-child');
  // console.log(pupilsList.selectedIndex);
  if (pupilsList.selectedIndex > 0) {
    selPupil = pupilsList.options[pupilsList.selectedIndex].value;
  } else {
    selPupil = '';
  }
  // console.log(selPupil);

  if (markTables.length > 0 && pupilsList.selectedIndex == 0) {
    markTables[0].querySelectorAll('tr').forEach((element, index) => {
      element.classList.remove('hidden');
    });
    markTables[1].querySelectorAll('tr').forEach((element, index) => {
      element.classList.remove('hidden');
    });
  } else if (markTables.length > 0 && pupilsList.selectedIndex > 0) {
    markTables[0].querySelectorAll('tr').forEach((element, index) => {
      if (pupilsList.selectedIndex != index + 1)
        element.classList.add('hidden');
      else element.classList.remove('hidden');
    });

    markTables[1].querySelectorAll('tr').forEach((element, index) => {
      if (pupilsList.selectedIndex != index + 1)
        element.classList.add('hidden');
      else element.classList.remove('hidden');
    });
  }
}

pupilsList.addEventListener('change', selectPupil);

function fillPupilsList(pupilsTable, pupilsCount, firstCell) {
  while (pupilsList.hasChildNodes()) {
    pupilsList.removeChild(pupilsList.firstChild);
  }

  pupilsList.innerHTML += '<option>Alle</option>';
  for (let i = 1; i <= pupilsCount; ++i) {
    pupilsList.innerHTML += `<option>${
      pupilsTable.querySelector(`tr:nth-child(${i})`).textContent
    }</option>`;
    // console.log(`${pupilsTable.querySelector(`tr:nth-child(${i})`).textContent}`);
  }

  firstCell.append(pupilsList);
}

function addEventListenerToMarkCell() {
  let mc = document.querySelectorAll(
    '#xgrid .xcell.c-1-1 td[class*="cell--2-"]'
  );
  console.log(mc);
  mc.forEach((element) => {
    element.addEventListener('click', (event) => {
      let markCell = event.target;

      // if(markCell.nodeName == 'SPAN') {
      // markCell.dispatchEvent(new Event('dblclick'));
      console.log('click');
      // }
    });
  });
}

let observerMarks = new MutationObserver(() => {
  let pupilsTable = document.querySelector('.c-0-1 .scroller-v table');

  if (pupilsTable) {
    const firstCell = document.querySelector('#xgrid .xbody .c-0-0');

    observerMarks.disconnect();
    observerMarks = new MutationObserver(() => {
      let pupilsCount = pupilsTable.childElementCount;

      // console.log(pupilsCount);
      // console.log(firstCell);
      firstCell.innerHTML = `Schüler (${pupilsCount})`;
      fillPupilsList(pupilsTable, pupilsCount, firstCell);
      if (selPupil) {
        // console.log(selPupil);
        pupilsList.querySelectorAll('option').forEach((option) => {
          // console.log('in option');
          if (option.textContent == selPupil) {
            // option.select = true;
            pupilsList.value = selPupil;
            selectPupil();
            return;
          }
        });
      }
    });

    observerMarks.observe(pupilsTable, { childList: true, subtree: true });
    addEventListenerToMarkCell();
  }
});

observerMarks.observe(document.querySelector('body'), {
  childList: true,
  subtree: true,
});

// let pupils = document.querySelector('#xgrid .xcell.c-0-1');

// pupils.addEventListener('click', event => {
// 	let pupilCell = event.target;
// 	// console.log(pupilCell);
// 	if(event.ctrlKey && pupilCell.nodeName == 'SPAN') {
// 		event.stopImmediatePropagation();
// 		pupilsList.value = pupilCell.textContent;
// 		pupilsList.dispatchEvent(new Event('change'));
// 		pupilsList.focus();
// 	}
// })

document
  .querySelector('#xgrid .xcell.c-0-1')
  .addEventListener('click', (event) => {
    let pupilCell = event.target;
    // console.log(pupilCell);
    if (event.ctrlKey && pupilCell.nodeName == 'SPAN') {
      event.stopImmediatePropagation();
      pupilsList.value = pupilCell.textContent;
      pupilsList.dispatchEvent(new Event('change'));
      pupilsList.focus();
    }
  });

const navTop = document.querySelector('#navTop');
const divEditor = document.querySelector('#divEditor');
const classClassSubject = document.querySelector('.row.mb-2');

navTop.appendChild(classClassSubject);
navTop.appendChild(divEditor);
