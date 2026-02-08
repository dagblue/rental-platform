module.exports = {
    '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
    '*.{json,md,yml,yaml,html}': ['prettier --write'],
    '*.{css,scss}': ['prettier --write'],
    '*.{graphql,gql}': ['prettier --write']
  };