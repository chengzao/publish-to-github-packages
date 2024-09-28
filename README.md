# Publish To Github Packages Demo

- [使用github package](https://docs.github.com/zh/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

## Install package

- 1.create `.npmrc` file

```bash
@chengzao:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_ACCESS_TOKEN
```

- 2.install gh-toolkit-utils

```bash
npm install @chengzao/gh-toolkit-utils
```

- 3.install gh-toolkit-cli

```bash
npm install @chengzao/gh-toolkit-cli
```

## Publish with changeset

```
npx changeset pre enter beta # enter beta version

npx changeset add  # add package

npx changeset version # create package changelog

npx changeset publish # publish package
```