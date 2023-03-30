export function getI18nText({ stringTokens, variables, translations, locale }) {
  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "long",
  });
  const pluralRules = new Intl.PluralRules(locale);
  const listFormat = new Intl.ListFormat(locale);
  const relativeTimeFormat = new Intl.RelativeTimeFormat(locale);

  const utils = {
    date(value) {
      if (typeof value === "number") {
        return dateTimeFormat.format(value);
      }

      return dateTimeFormat.format(new Date(value));
    },

    number(value, currency) {
      let options;
      if (currency) {
        options = {
          style: "currency",
          currency,
        };
      }

      const numberFormat = new Intl.NumberFormat(locale, options);

      return numberFormat.format(value);
    },

    plural(key, number) {
      const plural = pluralRules.select(number);

      return `${utils.number(number)} ${key[plural]}`;
    },

    list(...args) {
      return listFormat.format(args);
    },

    relativeTime(value, unit) {
      return relativeTimeFormat.format(value, unit);
    },

    parseString(str) {
      if (str.startsWith("#")) {
        return translations[locale]?.[str.slice(1)];
      }

      if (str.startsWith("$")) {
        return variables[str.slice(1)];
      }

      return str;
    },
  };

  let i18nText = "";

  for (let token of stringTokens) {
    if (Array.isArray(token)) {
      const args = [];
      let method;
      for (let arg of token) {
        if (typeof arg === "number") {
          args.push(arg);
          continue;
        }

        if (arg.startsWith("@")) {
          method = utils[arg.slice(1)];
          continue;
        }

        const parsedString = utils.parseString(arg);
        if (parsedString !== undefined) {
          args.push(parsedString);
        }
      }

      i18nText += method(...args);
      continue;
    }

    const parsedString = utils.parseString(token);
    if (parsedString !== undefined) {
      i18nText += parsedString;
    }
  }

  return i18nText;
}
