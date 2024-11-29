import onChange from 'on-change';

export default (state, elements, i18n) => {
  const renderError = () => {
    elements.sendBtn.removeAttribute('disabled');
    const feedbackContainer = document.querySelector('.feedback');
    const formInput = document.getElementById('url-input');
    feedbackContainer.classList.remove('text-success');
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.textContent = state.addRssForm.message;
    formInput.classList.add('is-invalid');
    formInput.focus();
  };

  const renderApp = () => {
    console.log('RENDER APP');
    elements.sendBtn.removeAttribute('disabled');
    elements.form.reset();
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
    <h2 class='card-title h4'>${i18n.t('posts')}</h2>
    </div>
    </div>`;
    const postsCard = document.querySelector('.posts .card');
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    postsCard.append(postsList);

    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = `<div class='card border-0'>
    <div class='card-body'>
    <h2 class='card-title h4'>${i18n.t('feeds')}</h2>
    </div>
    </div>`;
    const feedsCard = document.querySelector('.feeds .card');
    const feedList = document.createElement('ul');
    feedList.classList.add('list-group-item', 'border-0', 'rounded-0');
    feedsCard.append(feedList);

    state.feeds.forEach((feed) => {
      const feedItem = document.createElement('li');
      feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedItem.innerHTML = `<h3 class='h6 m-0'>${feed.title}</h3>
      <p class='m-0 small text-black-50'>${feed.description}</p>`;
      feedList.append(feedItem);
    });

    const listGroup = document.querySelector('.list-group');
    listGroup.innerHTML = '';
    state.posts.forEach((post) => {
      const postItem = document.createElement('li');
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      postItem.innerHTML = `<a href='${post.link}' class='fw-bold' data-id='${post.id}' target='_blank' data-id='noopener noreferrer'>${post.title}</a>
      <button type='button' class='btn btn-outline-primary btn-sm' data-id='${post.id}' data-bs-toggle='#modal'>${i18n.t('viewPost')}</button>`;
      listGroup.append(postItem);
    });
    // -------------------------------------------------------------------------------
    const btnsOpen = document.querySelectorAll('.list-group .btn');

    btnsOpen.forEach((btnn) => btnn.addEventListener('click', (ee) => {
      const res = ee.target;
      const btnId = res.getAttribute('data-id');
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
    }));
  // --------------------------------------------------------------
  };

  const modalOpen = () => {
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalDescription = document.querySelector('.modal .modal-body');
    const reedMoreUrl = document.querySelector('.modal .modal-footer .full-article');

    const id = state.postBtnActive;
    const [post] = state.posts.filter((p) => p.id === id);

    modalTitle.innerHTML = post.title;
    modalDescription.innerHTML = post.description;
    reedMoreUrl.setAttribute('href', post.link);

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

  const watchedState = onChange(state, (path, value) => {
    // const { processState } = state;

    switch (value) {
      case 'processing':
        elements.sendBtn.setAttribute('disabled', true);
        break;
      case 'success':
        renderApp(state, elements, i18n);
        break;
      case 'error':
        renderError(state, elements);
        break;
      case 'modalOpen':
        modalOpen(state, i18n);
        break;
      case 'modalClose':
        modalClose();
        break;
      case 'update':
        renderApp(state, elements, i18n);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
