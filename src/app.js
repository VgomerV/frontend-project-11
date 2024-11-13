import axios from 'axios';
import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import resources from './locales/index.js';
import render from './view.js';
import { getUrlWithProxy, parserRss } from './utilites.js';

const validator = (urlValue, state, localization) => {
  const { urlList } = state;
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
      error: '',
    },
    urlList: [],
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    render(state, path, value, previousValue);
  });

  const form = document.querySelector('form');
  const btn = document.querySelector('[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const urlValue = formData.get('url');

    btn.setAttribute('disabled', '');

    validator(urlValue, state, localization)
      .then((result) => {
        watchedState.addRssForm.error = '';
        watchedState.addRssForm.isValid = true;

        return result.url;
      })
      .then((url) => {
        axios(getUrlWithProxy(url))
          .then((response) => {
            const [data, error] = parserRss(response.data.contents);

            btn.removeAttribute('disabled');

            if (error) {
              watchedState.addRssForm.error = localization.t(resources[state.appLng].errors.urlNotRss);
              watchedState.addRssForm.isValid = false;
            } else {
              watchedState.urlList = [...watchedState.urlList, url];
              form.reset();
            }
          })
          .catch(() => {
            btn.removeAttribute('disabled');
            watchedState.addRssForm.error = localization.t(resources[state.appLng].errors.networkErr);
            watchedState.addRssForm.isValid = false;
          });
      })
      .catch((err) => {
        console.log(err.errors);
        console.log(watchedState.addRssForm.error);
        btn.removeAttribute('disabled');

        watchedState.addRssForm.error = err.errors;
        watchedState.addRssForm.isValid = false;
      });
  });
};
