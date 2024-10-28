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
