import axios from 'axios';
import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './view.js';

const validator = (data, feeds, i18n) => {
  setLocale({
    string: {
      url: i18n.t('errors.notValid'),
    },
    mixed: {
      notOneOf: i18n.t('errors.repeatRss'),
    },
  });
  const schema = object().shape({
    url: string().trim().url().notOneOf(feeds),
  });
  return schema.validate(data, { abortEarly: false });
};

const getUrlWithProxy = (url) => {
  const proxy = 'https://allorigins.hexlet.app/';
  return `${proxy}get?disableCache=true&url=${url}`;
};

const parserRss = (data) => {
  const parser = new DOMParser();
  const parseData = parser.parseFromString(data, 'application/xml');
  const isError = parseData.querySelector('parsererror') !== null;
  return [parseData, isError];
};

const createPost = (data, feedId) => ({
  visited: false,
  feedId,
  id: uniqueId(),
  link: data.querySelector('link').textContent,
  title: data.querySelector('title').textContent,
  description: data.querySelector('description').textContent,
});

const updatePosts = (state, i18n) => {
  const watchedState = state;
  const { feeds } = watchedState;

  feeds.forEach((feed) => {
    const { id, url } = feed;
    axios(getUrlWithProxy(url))
      .then((response) => {
        const [data] = parserRss(response.data.contents);
        const posts = data.querySelectorAll('item');

        const postsTitle = watchedState.posts.filter((post) => post.feedId === id)
          .map((post) => post.title);

        posts.forEach((post) => {
          const title = post.querySelector('title').textContent;
          if (!postsTitle.includes(title)) {
            const newPost = createPost(post, id);
            watchedState.posts = [...watchedState.posts, newPost];
          }
        });
      })
      .catch(() => {
        watchedState.feedbackMessage = i18n.t('errors.networkErr');
        watchedState.form.processState = 'error';
      });
  });
  setTimeout(() => updatePosts(watchedState, i18n), 5000);
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

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.defaultLng,
    debug: false,
    resources,
  });

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
    watchedState.form.processState = 'processing';
    watchedState.feedbackMessage = '';

    const formData = new FormData(e.target);
    const urlValue = formData.get('url');

    const listLoadedFeed = state.feeds.map((feed) => feed.url);

    validator({ url: urlValue }, listLoadedFeed, i18n)
      .then(({ url }) => {
        watchedState.form.isValid = true;
        axios(getUrlWithProxy(url))
          .then((response) => {
            const [data, error] = parserRss(response.data.contents);
            if (error) {
              watchedState.form.processState = 'error';
              watchedState.feedbackMessage = i18n.t('errors.notRss');
            } else {
              watchedState.form.processState = 'success';
              watchedState.feedbackMessage = i18n.t('rssAdded');

              const feedId = uniqueId();
              const feed = {
                id: feedId,
                url,
                title: data.querySelector('title').textContent,
                description: data.querySelector('description').textContent,
              };
              watchedState.feeds = [feed, ...watchedState.feeds];

              const posts = data.querySelectorAll('item');
              const newPosts = [];
              posts.forEach((post) => {
                const newPost = createPost(post, feedId);
                newPosts.push(newPost);
              });
              watchedState.posts = [...watchedState.posts, ...newPosts.reverse()];

              updatePosts(watchedState, i18n);
            }
          })
          .catch(() => {
            watchedState.form.processState = 'error';
            watchedState.feedbackMessage = i18n.t('errors.networkErr');
          });
      })
      .catch(() => {
        watchedState.form.isValid = false;
        watchedState.form.processState = 'error';
        watchedState.feedbackMessage = i18n.t('errors.repeatRss');
      });
  });
};
