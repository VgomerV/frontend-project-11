import { object, string } from 'yup';
import onChange from 'on-change';

const render = (state) => {
  const feedbackContainer = document.querySelector('.feedback');
  const formInput = document.querySelector('.form-control');

  if (!state.valid) {
    formInput.classList.add('is-invalid');
    feedbackContainer.textContent = state.errors;
  } else {
    formInput.classList.remove('is-invalid');
    feedbackContainer.textContent = '';
    form.reset();
  }

  formInput.focus();
};

const valid = (urlValue, state) => {
  const schema = object({
    url: string().min(1).url('Ссылка должна быть валидным URL').notOneOf(state.urls, 'RSS уже существует'),
  });

  return schema.validate({ url: urlValue });
};

export default () => {
  const state = {
    valid: true,
    errors: [],
    urls: [],
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    console.log(path);
    console.log(previousValue);
    console.log(value);
    console.log(JSON.stringify(state));
    render(state);
  });

  console.log(`BEGIN===${JSON.stringify(state)}`);

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    valid(url, watchedState)
      .then((result) => {
        console.log('RESOLVE');
        watchedState.valid = true;
        watchedState.urls.push(result.url);
      })
      .catch((err) => {
        console.log('REJECT');
      });

    state.urls.push(url);

    console.log(JSON.stringify(state));
  });
};
