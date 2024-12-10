export default (i18n) => {
  const configLocale = {
    string: {
      url: i18n.t('errors.notValid'),
    },
    mixed: {
      notOneOf: i18n.t('errors.repeatRss'),
    },
  };

  return configLocale;
};
