import axios from 'axios';
import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './view.js';

const validator = (value, state, i18n) => {
  const listUrlFeed = state.feeds.map((feed) => feed.url);
  setLocale({
    string: {
      url: i18n.t('errors.notValid'),
    },
    mixed: {
      notOneOf: i18n.t('errors.repeatRss'),
    },
  });
  const schema = object().shape({
    url: string().trim().url().notOneOf(listUrlFeed),
  });
  return schema.validate(value, { abortEarly: false });
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
  feedId,
  id: uniqueId(),
  link: data.querySelector('link').textContent,
  title: data.querySelector('title').textContent,
  description: data.querySelector('description').textContent,
});

const updatePosts = (state, i18n) => {
  const watchedState = state;
  watchedState.processState = 'wait';
  console.log(watchedState.processState);
  const { feeds } = watchedState;

  feeds.forEach((feed) => {
    const { id, url } = feed;
    axios(getUrlWithProxy(url))
      .then((response) => {
        const [data] = parserRss(response.data.contents);
        const posts = data.querySelectorAll('item');
        const postList = watchedState.posts.map((post) => post.title);
        posts.forEach((post) => {
          const title = post.querySelector('title').textContent;
          if (!postList.includes(title)) {
            const newPost = createPost(post, id);
            watchedState.posts = [newPost, ...watchedState.posts];
          }
        });
      })
      .catch(() => {
        watchedState.addRssForm.message = i18n.t('errors.networkErr');
        watchedState.processState = 'error';
      });
  });
  watchedState.processState = 'success';
  console.log(watchedState.processState);
  setTimeout(() => updatePosts(watchedState, i18n), 5000);
};

export default () => {
  const state = {
    defaultLng: 'ru',
    processState: 'wait',
    addRssForm: {
      message: '',
    },
    feeds: [],
    posts: [],
    postBtnActive: '',
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.defaultLng,
    debug: false,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    sendBtn: document.querySelector('.rss-form .btn'),
    postContainer: document.querySelector('.posts'),
    feedContainer: document.querySelector('.feeds'),
  };

  const watchedState = watch(state, elements, i18n);
  console.log(watchedState);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processState = 'processing';

    const formData = new FormData(e.target);
    const urlValue = formData.get('url');

    validator({ url: urlValue }, watchedState, i18n)
      .then(({ url }) => {
        axios(getUrlWithProxy(url))
          .then((response) => {
            const [data, error] = parserRss(response.data.contents);
            if (error) {
              watchedState.addRssForm.message = i18n.t('errors.notRss');
              watchedState.processState = 'error';
            } else {
              const feedId = uniqueId();
              const feed = {
                id: feedId,
                url,
                pubDate: new Date(data.querySelector('pubDate').textContent),
                title: data.querySelector('title').textContent,
                description: data.querySelector('description').textContent,
              };
              watchedState.feeds = [...watchedState.feeds, feed];
              const posts = data.querySelectorAll('item');
              posts.forEach((post) => {
                const newPost = createPost(post, feedId);
                watchedState.posts = [...watchedState.posts, newPost];
              });
              watchedState.addRssForm.message = i18n.t('rssAdded');
              watchedState.processState = 'success';
              updatePosts(watchedState, i18n);
            }
          })
          .catch(() => {
            watchedState.addRssForm.message = i18n.t('errors.networkErr');
            watchedState.processState = 'error';
          });
      })
      .catch((err) => {
        watchedState.addRssForm.message = err.errors;
        watchedState.processState = 'error';
      });
  });
};
