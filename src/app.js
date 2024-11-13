import axios from 'axios';
import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import resources from './locales/index.js';
import render from './view.js';

const validator = (urlValue, state, localization) => {
  const { urlList } = state.addRssForm;

  setLocale({
    string: {
      url: localization.t(resources[state.appLng].errors.urlIncorrect),
    },
    mixed: {
      notOneOf: localization.t(resources[state.appLng].errors.urlIsAlredy),
    },
  });

  const schema = object({
    url: string().trim().url().notOneOf(urlList),
  });

  return schema.validate({ url: urlValue });
};

export default () => {
  axios.get('https://lorem-rss.hexlet.app/feed')
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log('ERROR');
      console.log(error);
    });

  const localization = i18n.createInstance();
  localization.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const state = {
    appLng: 'ru',
    addRssForm: {
      isValid: true,
      errors: {
        urlIncorrect: '',
        urlNotRss: '',
      },
      urlList: [],
    },
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    render(state, path, value, previousValue);
  });

  const form = document.querySelector('form');
  const btn = document.querySelector('[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');

    btn.setAttribute('disabled', '');

    validator(url, state, localization)
      .then((result) => {
        btn.removeAttribute('disabled');

        watchedState.addRssForm.urlList.push(result.url);
        watchedState.addRssForm.errors.urlIncorrect = '';
        watchedState.addRssForm.isValid = true;

        form.reset();
      })
      .catch((err) => {
        btn.removeAttribute('disabled');

        watchedState.addRssForm.errors.urlIncorrect = err.errors;
        watchedState.addRssForm.isValid = false;
      });
  });
};
