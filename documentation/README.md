# 🔍 📝 🤖 markdown-translation github action

translate your markdown documentation using [markdown-translation](https://github.com/diplodoc-platform/markdown-translation) library.

action controlled by issuing commands via comments inside pull requests.

allows you to: extract and compose xliff, read more about usage under [usage section](#-usage)

read more about it under the Usage section.

##### 🔧 installation

🚧 Work In Progress 🚧

##### ⚙️ configuration

action should be configured appropriately

##### 🕑 triggers

action intended to be ran on opened pull requests and on new comments.

```
on:
  pull_request:
    types: [opened]
    brances:
      - main
  issue_comment:
    types: [created, edited]
```

##### 🔒 permissions

action expects you to provide appropriate permission

```
permissions:
  pull-requests: write
  contents: write
  packages: write
  issues: write
```

##### ⌨️ input

action expects be ran with appropriate input

- allowed-associations: stringified array of author associations to filter out actors that are not allowed to perform actions.
  [gh docs: comment author association](https://docs.github.com/en/graphql/reference/enums#commentauthorassociation)
- github-token: github token on whoose behalf to perform actions.

```
with:
  allowed-associations: '["OWNER", "COLLABORATOR"]'
  github-token: ${{secrets.GITHUB_TOKEN}}
```

##### 🧑‍💻 usage

commands are issued inside the pull request,
the action will provide you with instructions.

commands start with mandatory prefix: **markdown-translation**,
then follows command name and parameters.

commands don't have to be the only text inside the comment,
but they should start with the new line.

tokens inside command string should be separated by spaces.

##### 💡 requirements

- commands start from the new line
- commands have **markdown-translation** prefix
- tokens inside command string are separated with spaces
- comment author should have appropriate repository permissions
- comment author should have appropriate associations

##### 🤖 commands

- extract
- compose

##### 🔍 extract

command extracts xliff and skeleton from markdown files at **input_folder** path
and stores them at the **output_folder** path.

##### 🎛️ parameters

paths are relative to the repository root

- input_folder(**required**): path with markdown files
- output_folder(**required**): path to store extracted xliff and skeleton files
- sll(optional): source language locale (default: ru-RU)
- rll(optional): target language locale (default: en-US)

##### 🚀 example

```
markdown-translation extract documentation documentation-xliff
```

##### 📝 compose

command composes xliff and skeleton files from **input_folder** into markdown files
and stores them at the **output_folder** path.

##### 🎛️ parameters

paths are relative to the repository root

- input_folder(**required**): path with extracted xliff and skeleton files
- output_folder(**required**): path to store composed markdown

##### 🚀 example

```
markdown-translation extract documentation-xliff documentation-translated
```
