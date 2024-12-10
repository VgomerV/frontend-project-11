export default (data) => {
  const parser = new DOMParser();
  const parseData = parser.parseFromString(data.contents, 'application/xml');
  const parseError = parseData.querySelector('parsererror');

  if (parseError) {
    const error = new Error();
    error.name = 'parseError';
    throw error;
  }

  const feed = {
    title: parseData.querySelector('title').textContent,
    description: parseData.querySelector('description').textContent,
  };

  const [...postsItem] = parseData.querySelectorAll('item');

  const posts = postsItem.map((post) => ({
    link: post.querySelector('link').textContent,
    title: post.querySelector('title').textContent,
    description: post.querySelector('description').textContent,
  }));

  return [feed, posts];
};
