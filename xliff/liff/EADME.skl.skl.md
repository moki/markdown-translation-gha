# %%%1%%%
%%%2%%% [%%%3%%%](https://github.com/diplodoc-platform/markdown-translation) %%%4%%%

%%%5%%%

%%%6%%% [%%%7%%%](#-usage)

%%%8%%%
##### %%%9%%%
%%%10%%%
##### %%%11%%%
%%%12%%%
##### %%%13%%%
%%%14%%%
```
on:
  pull_request:
    types: [opened]
    brances:
      - main
  issue_comment:
    types: [created, edited]
```
##### %%%15%%%
%%%16%%%
```
permissions:
  pull-requests: write
  contents: write
  packages: write
  issues: write
```
##### %%%17%%%
%%%18%%%
- %%%19%%%
[%%%20%%%](https://docs.github.com/en/graphql/reference/enums#commentauthorassociation)
- %%%21%%%
```
with:
  allowed-associations: '["OWNER", "COLLABORATOR"]'
  github-token: ${{secrets.GITHUB_TOKEN}}
```
##### %%%22%%%
%%%23%%%
%%%24%%%

%%%25%%% **%%%26%%%**%%%27%%%
%%%28%%%

%%%29%%%
%%%30%%%

%%%31%%%
##### %%%32%%%
- %%%33%%%
- %%%34%%% **%%%35%%%** %%%36%%%
- %%%37%%%
- %%%38%%%
- %%%39%%%
##### %%%40%%%
- %%%41%%%
- %%%42%%%
##### %%%43%%%
%%%44%%% **%%%45%%%** %%%46%%%
%%%47%%% **%%%48%%%** %%%49%%%
##### %%%50%%%
%%%51%%%
- %%%52%%%**%%%53%%%**%%%54%%%
- %%%55%%%**%%%56%%%**%%%57%%%
- %%%58%%%
- %%%59%%%
##### %%%60%%%
```
markdown-translation extract documentation documentation-xliff
```
##### %%%61%%%
%%%62%%% **%%%63%%%** %%%64%%%
%%%65%%% **%%%66%%%** %%%67%%%
##### %%%68%%%
%%%69%%%
- %%%70%%%**%%%71%%%**%%%72%%%
- %%%73%%%**%%%74%%%**%%%75%%%
##### %%%76%%%
```
markdown-translation extract documentation-xliff documentation-translated
```