import onChange from 'on-change';

export default (state, elements, i18n) => {
  const {
    body, form, input, sendBtn, feedbackContainer, postsContainer, feedsContainer, preview,
  } = elements;

  const handleFormState = (value) => {
    if (value === 'processing') {
      sendBtn.setAttribute('disabled', true);
      input.setAttribute('readonly', true);
      return;
    }

    sendBtn.removeAttribute('disabled');
    input.removeAttribute('readonly');

    if (value === 'success') {
      form.reset();
      input.focus();
    }

    if (state.form.isValid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid')
    }
  };

  const renderFeedback = () => {
    if (state.form.processState === 'error') {
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
    } else {
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
    }

    feedbackContainer.textContent = state.feedbackMessage;
  };

  const renderFeeds = () => {
    feedsContainer.innerHTML = '';
    const divCard = document.createElement('div');
    divCard.classList.add('card', 'border-0');

    const divCardBody = document.createElement('div');
    divCardBody.classList.add('card-body');

    const h2Cadr = document.createElement('h2');
    h2Cadr.classList.add('card-title', 'h4');
    h2Cadr.innerHTML = i18n.t('feeds');

    divCardBody.append(h2Cadr);

    divCard.append(divCardBody);

    const feedList = document.createElement('ul');
    feedList.classList.add('list-group-item', 'border-0', 'rounded-0');

    state.feeds.forEach((feed) => {
      const feedItem = document.createElement('li');
      feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedItem.innerHTML = `<h3 class='h6 m-0'>${feed.title}</h3>
      <p class='m-0 small text-black-50'>${feed.description}</p>`;
      feedList.append(feedItem);
    });
    divCard.append(feedList);
    feedsContainer.append(divCard);
  };

  const renderPosts = () => {
    postsContainer.innerHTML = '';
    const divCard = document.createElement('div');
    divCard.classList.add('card', 'border-0');

    const divCardBody = document.createElement('div');
    divCardBody.classList.add('card-body');

    const h2Cadr = document.createElement('h2');
    h2Cadr.classList.add('card-title', 'h4');
    h2Cadr.innerHTML = i18n.t('posts');
    divCardBody.append(h2Cadr);
    divCard.append(divCardBody);

    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');

    state.posts.forEach((post) => {
      const postItem = document.createElement('li');
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const viewPostBtn = document.createElement('button');
      viewPostBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      viewPostBtn.setAttribute('type', 'button');
      viewPostBtn.setAttribute('data-id', post.id);
      viewPostBtn.setAttribute('data-bs-toggle', '#modal');
      viewPostBtn.innerHTML = i18n.t('viewPost');
      postItem.prepend(viewPostBtn);

      const link = document.createElement('a');
      link.setAttribute('href', post.link);
      link.setAttribute('data-id', post.id);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      if (post.visited) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
      } else {
        link.classList.remove('fw-normal', 'link-secondary');
        link.classList.add('fw-bold');
      }
      link.innerHTML = post.title;
      postItem.prepend(link);

      postsList.prepend(postItem);
    });

    divCard.append(postsList);
    postsContainer.append(divCard);
  };

  const renderOpenPreview = () => {
    const id = state.preview.postID;
    const [post] = state.posts.filter((p) => p.id === id);

    preview.title.innerHTML = post.title;
    preview.description.innerHTML = post.description;
    preview.readMore.setAttribute('href', post.link);

    body.classList.add('modal-open');
    body.setAttribute('style', 'overflow: hidden; padding-right: 15px;');
    preview.modal.classList.add('show');
    preview.modal.setAttribute('style', 'display: block;', 'aria-modal = true', 'role = dialog;');
    preview.modal.setAttribute('aria-modal', true);
    preview.modal.setAttribute('role', 'dialog');
    preview.modal.removeAttribute('aria-hidden');
    const modalShadow = document.createElement('div');
    modalShadow.classList.add('modal-backdrop', 'fade', 'show');
    body.append(modalShadow);
  };

  const renderClosePreview = () => {
    body.classList.remove('modal-open');
    body.removeAttribute('style');
    preview.modal.classList.remove('show');
    preview.modal.setAttribute('style', 'display: none', 'aria-hidden = true;');
    preview.modal.removeAttribute('aria-modal', 'role');
    preview.modal.removeAttribute('role');
    const modalShadow = document.querySelector('.modal-backdrop');
    modalShadow.remove();
  };

  const watchedState = onChange(state, (path, value) => {
    const [rootPath] = path.split('.');

    switch (rootPath) {
      case 'form':
        handleFormState(value);
        break;
      case 'feedbackMessage':
        renderFeedback(value);
        break;
      case 'feeds':
        renderFeeds();
        break;
      case 'posts':
        renderPosts();
        break;
      case 'preview':
        if (value === 'open') {
          renderOpenPreview();
        } else if (value === 'close') {
          renderClosePreview();
        }
        break;
      default:
        break;
    }
  });

  return watchedState;
};
