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

function init() {
  // const tblMissings = document.querySelector('#tblMissings');
  const tblPupils = document.querySelector('#tblPupils');
  if (tblPupils) {
    // observer.disconnect();

    // observerMissingTable = new MutationObserver(cleanUpMissingTable);
    // observerMissingTable.observe(tblMissings.querySelector('tbody'), {
    //   childList: true,
    // });

    let missingPupil = JSON.parse(sessionStorage.getItem('missingPupil'));
    if (missingPupil) {
      // console.log(missingPupil);
      // selClassOrGroup.value = missingPupil[1];
      let tblPupils = document.querySelector('#tblPupils');
      // console.log(tblPupils);

      // observerTblPupils = new MutationObserver( () => {
      let tdPupils = tblPupils.querySelectorAll('tbody tr td:first-child');
      if (tdPupils.length > 0) {
        // observerTblPupils.disconnect();
        // console.log(tdPupils);
        // console.log(missingPupil);

        tdPupils.forEach((pupil) => {
          if (pupil.textContent.trim() === missingPupil[0].trim()) {
            // console.log(pupil.textContent, missingPupil[0].trim());
            // console.log(sessionStorage.removeItem('missingPupil'));
            pupil.parentElement.click();

            return;
          }
        });
      }
      // });

      // observerTblPupils.observe(tblPupils, { childList: true, subtree: true})
    }
  }
}

document.addEventListener('keydown', (event) => {
  const btnSave = document.querySelector('#btnSave');
  const btnMSave = document.querySelector('#btnMSave');
  const btnMDelete = document.querySelector('#btnMDelete');

  // console.log(btnSave);
  // console.log(btnMSave);
  // console.log(btnLSave);

  if (
    mdEditor.style.display !== 'block' &&
    event.ctrlKey &&
    event.key === 's'
  ) {
    // Prevent the Save dialog to open
    event.preventDefault();
    btnSave.click();
  } else if (
    mdEditor.style.display === 'block' &&
    event.ctrlKey &&
    event.key === 's'
  ) {
    // Prevent the Save dialog to open
    event.preventDefault();
    btnMSave.click();
  } else if (
    mdEditor.style.display === 'block' &&
    event.ctrlKey &&
    event.key === 'd'
  ) {
    event.preventDefault();
    btnMDelete.click();
  }
});

// init(); //2025-11-16

// let observer = new MutationObserver(init);
// observer.observe(document.querySelector('body'), {
//   childList: true,
//   subtree: true,
// });

addEventListener('load', () => {
  missing_interval = setInterval(() => {
    if (document.querySelector('#tblPupils') != undefined) {
      init();
      clearInterval(missing_interval);
    }
  }, 50);
});
