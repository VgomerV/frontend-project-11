import axios from 'axios';
import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import initLocale from './locales/init-locale.js';
import parser from './parser.js';
import watch from './view.js';

const validator = (data, feeds) => {
  const schema = object().shape({
    url: string().trim().url().notOneOf(feeds),
  });
  return schema.validate(data, { abortEarly: false });
};

const createUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get';
  const fullUrl = new URL(proxy);
  fullUrl.searchParams.set('disableCache', 'true');
  fullUrl.searchParams.set('url', url);

  return fullUrl.href;
};

const timeUpdate = 5000;

const updatePosts = (state, i18n) => {
  const watchedState = state;
  const { feeds } = watchedState;

  const promises = feeds.forEach((feed) => {
    const { id, url } = feed;
    axios(createUrl(url))
      .then(({ data }) => {
        const [, posts] = parser(data);

        const postsTitle = watchedState.posts.filter((post) => post.feedId === id)
          .map((post) => post.title);

        posts.forEach((post) => {
          if (!postsTitle.includes(post.title)) {
            const postId = uniqueId();
            const newPost = {
              visited: false, feedId: id, id: postId, ...post,
            };
            watchedState.posts = [...watchedState.posts, newPost];
          }
        });
      })
      .catch(() => {
        watchedState.feedbackMessage = i18n.t('errors.networkErr');
        watchedState.form.processState = 'error';
      });
  });
  Promise.all(promises)
    .then(() => setTimeout(() => updatePosts(watchedState, i18n), timeUpdate));
};

export default () => {
  const state = {
    defaultLng: 'ru',
    form: {
      processState: 'filling',
      isValid: true,
    },
    feedbackMessage: '',
    feeds: [],
    posts: [],
    preview: {
      state: 'close',
      postID: null,
    },
  };

  const elements = {
    body: document.querySelector('body'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    sendBtn: document.querySelector('.rss-form .btn'),
    feedbackContainer: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    preview: {
      modal: document.querySelector('.modal'),
      title: document.querySelector('.modal .modal-title'),
      description: document.querySelector('.modal .modal-body'),
      readMore: document.querySelector('.modal .modal-footer .full-article'),
      btnClose: document.querySelectorAll('.modal button'),
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.defaultLng,
    debug: false,
    resources,
  })
    .then(() => {
      setLocale(initLocale(i18n));
      const watchedState = watch(state, elements, i18n);

      elements.postsContainer.addEventListener('click', (e) => {
        const { tagName } = e.target;
        const id = e.target.getAttribute('data-id');
        const postLink = watchedState.posts.find((post) => post.id === id);
        switch (tagName) {
          case 'BUTTON':
            postLink.visited = 'visited';
            watchedState.preview.postID = id;
            watchedState.preview.state = 'open';
            break;
          case 'A':
            postLink.visited = 'visited';
            break;
          default:
            break;
        }
      });

      elements.preview.modal.addEventListener('click', (e) => {
        const { tagName } = e.target;
        if (tagName !== 'A') {
          watchedState.preview.state = 'close';
        }
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.feedbackMessage = '';

        const formData = new FormData(e.target);
        const urlValue = formData.get('url');

        const listLoadedFeed = state.feeds.map((feed) => feed.url);

        const validate = validator({ url: urlValue }, listLoadedFeed, i18n);
        const promises = Promise.all([validate]);
        promises
          .then(([{ url }]) => {
            watchedState.form.processState = 'processing';
            watchedState.form.isValid = true;
            return axios(createUrl(url));
          })
          .then(({ data }) => {
            const [feed, posts] = parser(data);
            watchedState.form.processState = 'success';
            watchedState.feedbackMessage = i18n.t('rssAdded');
            const feedId = uniqueId();
            const newFeed = { url: urlValue, id: feedId, ...feed };
            watchedState.feeds = [newFeed, ...watchedState.feeds];

            const newPosts = [];
            posts.forEach((post) => {
              const postId = uniqueId();
              const newPost = {
                visited: false, feedId, id: postId, ...post,
              };
              newPosts.push(newPost);
            });
            watchedState.posts = [...watchedState.posts, ...newPosts.reverse()];
            updatePosts(watchedState, i18n);
          })
          .catch((error) => {
            const errorName = error.name;
            watchedState.form.processState = 'error';
            switch (errorName) {
              case 'ValidationError':
                watchedState.form.isValid = false;
                watchedState.feedbackMessage = error.message;
                break;
              case 'AxiosError':
                watchedState.form.isValid = true;
                watchedState.feedbackMessage = i18n.t('errors.networkErr');
                break;
              case 'parseError':
                watchedState.form.isValid = true;
                watchedState.feedbackMessage = i18n.t('errors.notRss');
                break;
              default:
                throw new Error(`Unknown error type: ${error}`);
            }
          });
      });
    });
};
