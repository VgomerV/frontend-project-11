import axios from 'axios';
import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import render from './view.js';
import { getUrlWithProxy, parserRss } from './utilites.js';

const validator = (urlValue, state, i18n) => {
  const { urlAddList } = state;
  setLocale({
    string: {
      url: i18n.t(resources[state.appLng].errors.urlIncorrect),
    },
    mixed: {
      notOneOf: i18n.t(resources[state.appLng].errors.urlIsAlredy),
    },
  });
  const schema = object({
    url: string().trim().url().notOneOf(urlAddList),
  });
  return schema.validate({ url: urlValue });
};

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    appLng: 'ru',
    processState: 'init',
    addRssForm: {
      message: '',
    },
    urlAddList: [],
    feeds: [],
    posts: [],
    postBtnActive: '',
  };

  console.log(i18n.t(resources[state.appLng]));

  const watchedState = onChange(state, () => {
    if (state.processState !== 'processing') {
      render(state);
    }
  });

  const form = document.querySelector('.rss-form');
  const btn = document.querySelector('.rss-form .btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processState = 'processing';

    const formData = new FormData(e.target);
    const urlValue = formData.get('url');

    btn.setAttribute('disabled', '');

    validator(urlValue, state, i18n)
      .then((result) => {
        state.addRssForm.message = '';
        state.addRssForm.isValid = true;

        return result.url;
      })
      .then((url) => {
        axios(getUrlWithProxy(url))
          .then((response) => {
            btn.removeAttribute('disabled');

            const [data, error] = parserRss(response.data.contents);
            if (error) {
              state.addRssForm.message = i18n.t(resources[state.appLng].errors.urlNotRss);
              watchedState.processState = 'error';
            } else {
              watchedState.addRssForm.message = i18n.t(resources[state.appLng].rssAdded);
              watchedState.urlAddList = [...watchedState.urlAddList, url];

              const title = data.querySelector('title');
              const description = data.querySelector('description');

              const feed = {
                feedTitle: title.textContent,
                feedDescription: description.textContent,
              };

              data.querySelectorAll('item').forEach((item) => {
                const post = {
                  postId: uniqueId(),
                  url: item.querySelector('link').textContent,
                  title: item.querySelector('title').textContent,
                  description: item.querySelector('description').textContent,
                };
                state.posts = [...state.posts, post];
              });

              watchedState.feeds = [...watchedState.feeds, feed];

              watchedState.processState = 'completed';
              form.reset();
              const btnsOpen = document.querySelectorAll('.list-group .btn');
              btnsOpen.forEach((btnn) => btnn.addEventListener('click', (ee) => {
                const res = ee.target;
                const btnId = res.getAttribute('data-id');
                console.log(btnId);
                state.postBtnActive = btnId;
                watchedState.processState = 'modalOpen';
              }));

              const btnCloseX = document.querySelector('.modal .btn-close');
              btnCloseX.addEventListener('click', () => {
                watchedState.processState = 'modalClose';
              });

              const btnClose = document.querySelector('.modal-footer .btn-secondary');
              btnClose.addEventListener('click', () => {
                watchedState.processState = 'modalClose';
              });

              const postLink = document.querySelectorAll('.list-group-item a');
              postLink.forEach((a) => a.addEventListener('click', (eee) => {
                const link = eee.target;
                link.classList.remove('fw-bold');
                link.classList.add('fw-normal', 'link-secondary');
                console.log(link);
              }));
            }
          })
          .catch(() => {
            btn.removeAttribute('disabled');
            watchedState.addRssForm.message = i18n.t(resources[state.appLng].errors.networkErr);
            watchedState.processState = 'error';
          });
      })
      .catch((err) => {
        btn.removeAttribute('disabled');

        watchedState.addRssForm.message = err.errors;
        watchedState.processState = 'error';
      });
  });
};
