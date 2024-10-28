const btnSave = document.querySelector('#btnSave');

btnSave?.setAttribute('title', 'Ctrl + s');

document.addEventListener('keydown', (event) => {
  const mdEditor = document.querySelector('#mdEditor');

  if (mdEditor) return;

  if (event.ctrlKey && event.key === 's') {
    // Prevent the Save dialog to open
    event.preventDefault();
    btnSave.click();
  }
});

// document.querySelector('#divEditors > a:nth-child(5)').click();
