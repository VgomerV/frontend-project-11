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

export { getUrlWithProxy, parserRss };
