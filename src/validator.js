import { object, string, setLocale } from 'yup';
import resources from './locales/index.js';

export default (urlValue, state, localization) => {
  const { urlList } = state.addRssForm;

  setLocale({
    string: {
      url: localization.t(resources[state.appLng].errors.urlIncorrect),
    },
    mixed: {
      notOneOf: localization.t(resources[state.appLng].errors.urlIsAlredy),
    },
  });

  const schema = object({
    url: string().trim().url().notOneOf(urlList),
  });

  return schema.validate({ url: urlValue });
};
