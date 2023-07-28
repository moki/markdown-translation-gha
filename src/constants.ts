const usage = `\
#### 🔍 📝 🤖 markdown-translation

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

\`\`\`
markdown-translation extract documentation documentation-xliff
\`\`\`

##### 📝 compose

command composes xliff and skeleton files from **input_folder** into markdown files
and stores them at the **output_folder** path.

##### 🎛️ parameters

paths are relative to the repository root

- input_folder(**required**): path with extracted xliff and skeleton files
- output_folder(**required**): path to store composed markdown

##### 🚀 example

\`\`\`
markdown-translation extract documentation-xliff documentation-translated
\`\`\``;

export {usage};
export default {usage};
