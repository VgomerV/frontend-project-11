const renderError = (isValid, error) => {
  const feedbackContainer = document.querySelector('.feedback');
  const formInput = document.querySelector('.form-control');
  if (!isValid) {
    formInput.classList.add('is-invalid');
    feedbackContainer.textContent = error;
  } else {
    formInput.classList.remove('is-invalid');
    feedbackContainer.textContent = '';
  }
  formInput.focus();
};

export default (state, path, value, previousValue) => {
  const { error } = state.addRssForm;
  const { isValid } = state.addRssForm;
  renderError(isValid, error);
};
