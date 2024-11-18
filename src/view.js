const renderError = (state) => {
  const feedbackContainer = document.querySelector('.feedback');
  const formInput = document.getElementById('url-input');
  feedbackContainer.classList.remove('text-success');
  feedbackContainer.classList.add('text-danger');
  feedbackContainer.textContent = state.addRssForm.message;
  formInput.classList.add('is-invalid');
  formInput.focus();
};

const renderApp = (state) => {
  const feedbackContainer = document.querySelector('.feedback');
  const formInput = document.getElementById('url-input');
  feedbackContainer.classList.remove('text-danger');
  feedbackContainer.classList.add('text-success');
  feedbackContainer.textContent = state.addRssForm.message;
  formInput.classList.remove('is-invalid');
  formInput.focus();

  const postContainer = document.querySelector('.posts');
  postContainer.innerHTML = `<div class='card border-0'>
  <div class='card-body'>
  <h2 class='card-title h4'>Посты</h2>
  </div>
  </div>`;
  const postsCard = document.querySelector('.posts .card');
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsCard.append(postsList);

  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = `<div class='card border-0'>
  <div class='card-body'>
  <h2 class='card-title h4'>Фиды</h2>
  </div>
  </div>`;
  const feedsCard = document.querySelector('.feeds .card');
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group-item', 'border-0', 'rounded-0');
  feedsCard.append(feedList);

  state.feeds.forEach((feed) => {
    const feedItem = document.createElement('li');
    feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedItem.innerHTML = `<h3 class='h6 m-0'>${feed.feedTitle}</h3>
    <p class='m-0 small text-black-50'>${feed.feedDescription}</p>`;
    feedList.append(feedItem);
  });

  state.posts.forEach((post) => {
    const postItem = document.createElement('li');
    postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postItem.innerHTML = `<a href='${post.url}' class='fw-bold' data-id='${post.postId}' target='_blank' data-id='noopener noreferrer'>${post.title}</a>
    <button type='button' class='btn btn-outline-primary btn-sm' data-id='${post.postId}' data-bs-toggle='#modal'>Просмотр</button>`;
    postsList.append(postItem);
  });
};

const modalOpen = (state) => {
  const modalTitle = document.querySelector('.modal .modal-title');
  const modalDescription = document.querySelector('.modal .modal-body');
  const reedMoreUrl = document.querySelector('.modal .modal-footer .full-article');

  const id = state.postBtnActive;
  const [post] = state.posts.filter((p) => p.postId === id);

  modalTitle.innerHTML = post.title;
  modalDescription.innerHTML = post.description;
  reedMoreUrl.setAttribute('href', post.url);

  const body = document.querySelector('body');
  const modal = document.querySelector('.modal');
  body.classList.add('modal-open');
  body.setAttribute('style', 'overflow: hidden; padding-right: 15px;');
  modal.classList.add('show');
  modal.setAttribute('style', 'display: block;');
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
};

const modalClose = () => {
  const body = document.querySelector('body');
  const modal = document.querySelector('.modal');

  body.classList.remove('modal-open');
  body.setAttribute('style', '');

  modal.classList.remove('show');

  modal.setAttribute('style', 'display: none;');
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  modal.removeAttribute('role');
};

export default (state) => {
  const { processState } = state;
  console.log(processState);

  switch (processState) {
    case 'completed':
      renderApp(state);
      break;
    case 'error':
      renderError(state);
      break;
    case 'modalOpen':
      modalOpen(state);
      break;
    case 'modalClose':
      modalClose();
      break;
    default:
      throw new Error(`Unknown order state: '${state.processState}'!`);
  }
};
