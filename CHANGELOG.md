## Release [v4.0.1](https://github.com/sourcefuse/loopback4-audit-log/compare/v4.0.0..v4.0.1) April 25, 2023
Welcome to the April 25, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [Loopback version update](https://github.com/sourcefuse/loopback4-audit-log/issues/55) :- [chore(deps): update `@loopback/repository` version ](https://github.com/sourcefuse/loopback4-audit-log/commit/cc6f9cc78253de3257db25c77b8066672d8845eb) was commited on April 25, 2023 by [Shubham P](mailto:shubham.prajapat@sourcefuse.com)
    
      - to use the latest one
      
      -  GH-55
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v4.0.0](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.2.3..v4.0.0) April 25, 2023
Welcome to the April 25, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [Add Audit Log Mixin Wrapper Around Audit Log Mixin](https://github.com/sourcefuse/loopback4-audit-log/issues/57) :- [feat(mixin): add conditional audit repository mixin ](https://github.com/sourcefuse/loopback4-audit-log/commit/10257b6094df79497d30084cc42f3e15eef34e0c) was commited on April 25, 2023 by [Sunny Tyagi](mailto:107617248+Tyagi-Sunny@users.noreply.github.com)
    
      - To be used when the actual audit mixin is to be applied conditionally from the
      
      - flag from the environment variables
      
      - rather than the code.
      
      -  BREAKING CHANGE:
      
      - Audit Repository Mixin return type changed and now is being
      
      - returned as an abstract class. This
      
      - doesn&#39;t affect 99% of the users because in
      
      - crud repositories this mixin is already applied on the base class. Only those
      
      - who are directly assigning the mixin-ed class to some variable will have the
      
      - type error showing them.
      
      -  GH-57
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v3.2.3](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.2.2..v3.2.3) April 24, 2023
Welcome to the April 24, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [Loopback version update](https://github.com/sourcefuse/loopback4-audit-log/issues/55) :- [chore(deps): loopback version update ](https://github.com/sourcefuse/loopback4-audit-log/commit/681b74b1d582b95effa1fd4f4cb691a7a1828f93) was commited on April 24, 2023 by [RaghavaroraSF](mailto:97958393+RaghavaroraSF@users.noreply.github.com)
    
      - loopback version update
      
      -  GH-55
      
  
  - [Fix Sonar Quality Gate](https://github.com/sourcefuse/loopback4-audit-log/issues/47) :- [fix(chore): fixing sonar smells ](https://github.com/sourcefuse/loopback4-audit-log/commit/f7ac73a6566c1341b4c296b777989e527b7ff4bc) was commited on March 21, 2023 by [arpit1503khanna](mailto:108673359+arpit1503khanna@users.noreply.github.com)
    
      - * fix(chore): fixing sonar smells
      
      -  resolving sonar smells to improve quality gate
      
      -  GH-47
      
      - * fix(chore): fixing sonar smells
      
      -  resolving sonar smells to improve quality gate
      
      -  GH-47
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v3.2.2](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.2.1..v3.2.2) March 13, 2023
Welcome to the March 13, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [loopback version update](https://github.com/sourcefuse/loopback4-audit-log/issues/52) :- [chore(deps): loopback version update ](https://github.com/sourcefuse/loopback4-audit-log/commit/61a802203253499c8220602d43a0d0de77bbc8e4) was commited on March 13, 2023 by [Gautam Agarwal](mailto:108651274+gautam23-sf@users.noreply.github.com)
    
      - loopback version update
      
      -  GH-52
      
  
  - [Stale Bot missing in the repository](https://github.com/sourcefuse/loopback4-audit-log/issues/50) :- [chore(chore): add github stale bot ](https://github.com/sourcefuse/loopback4-audit-log/commit/ca66df2e24876ab18e8bd0ab01438155469ad78e) was commited on February 27, 2023 by [yeshamavani](mailto:83634146+yeshamavani@users.noreply.github.com)
    
      - Added stale.yml file to configure stale options
      
      -  GH-50
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v3.2.1](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.2.0..v3.2.1) February 17, 2023
Welcome to the February 17, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [Correct the changelog Format](https://github.com/sourcefuse/loopback4-audit-log/issues/48) :- [fix(chore): correct the changelog format ](https://github.com/sourcefuse/loopback4-audit-log/commit/3e3d492689e670707f01e909218e159a78d33778) was commited on February 17, 2023 by [yeshamavani](mailto:83634146+yeshamavani@users.noreply.github.com)
    
      - now issue description will be visible
      
      -  GH-48
      
  
  - [Package Update - loopback4-audit-log](https://github.com/sourcefuse/loopback4-audit-log/issues/45) :- [fix(chore): remove all current vulnerability of loopback4-audit-log ](https://github.com/sourcefuse/loopback4-audit-log/commit/88435374115061a0562729a45dfc1b597866dba1) was commited on February 17, 2023 by [Sunny Tyagi](mailto:107617248+Tyagi-Sunny@users.noreply.github.com)
    
      - * fix(chore): remove all curent vulnerability of loopback4-audit-log
      
      -  remove all curent vulnerability of loopback4-audit-log
      
      -  GH-45
      
      - * chore(deps): loopback package update
      
      -  loopback package update
      
      -  GH-45
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v3.2.0](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.6..v3.2.0) January 10, 2023
Welcome to the January 10, 2023 release of loopback4-audit-log. There are many updates in this version that we hope you will like, the key highlights include:

  - [](https://github.com/sourcefuse/loopback4-audit-log/issues/-43) :- [chore(deps): loopback version update ](https://github.com/sourcefuse/loopback4-audit-log/commit/33ef560fabf796b6d31ce8a2deb9e888bf24200b) was commited on January 10, 2023 by [Surbhi Sharma](mailto:98279679+Surbhi-sharma1@users.noreply.github.com)
    
      - updated version of the lb4 dependencies to the latest.
      
      -  GH-43
      
  
  - [](https://github.com/sourcefuse/loopback4-audit-log/issues/-39) :- [feat(chore): custom change log ](https://github.com/sourcefuse/loopback4-audit-log/commit/b8b9a8a8596c65998c5fcee0b7be7da85cc8b220) was commited on January 9, 2023 by [yeshamavani](mailto:83634146+yeshamavani@users.noreply.github.com)
    
      - * feat(chore): custom change log
      
      -  The change log will now have issues as well as commit for the change
      
      - this is customizable in the
      
      - md file
      
      -  GH-39
      
      - * feat(chore): now we will generate out custom changelog
      
      -  using git-release-notes npm package for this
      
      -  GH-39
      
  
Clink on the above links to understand the changes in detail.
  ___

## [3.1.6](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.5...v3.1.6) (2022-12-05)

## [3.1.5](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.4...v3.1.5) (2022-11-03)


### Bug Fixes

* **core:** reduce the updateById 3 DB calls to 2 ([#36](https://github.com/sourcefuse/loopback4-audit-log/issues/36)) ([f0ab446](https://github.com/sourcefuse/loopback4-audit-log/commit/f0ab4467cd952fbf686baf7005dc2079224ba087)), closes [#33](https://github.com/sourcefuse/loopback4-audit-log/issues/33) [#33](https://github.com/sourcefuse/loopback4-audit-log/issues/33)

## [3.1.4](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.3...v3.1.4) (2022-10-31)

## [3.1.3](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.2...v3.1.3) (2022-09-09)

## [3.1.2](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.1...v3.1.2) (2022-06-24)


### Bug Fixes

* **component:** missing return type ([fb9b16a](https://github.com/sourcefuse/loopback4-audit-log/commit/fb9b16ac3bd1e30134e10e74b0ef13efc008544b)), closes [#0](https://github.com/sourcefuse/loopback4-audit-log/issues/0)

## [3.1.1](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.1.0...v3.1.1) (2022-06-17)

# [3.1.0](https://github.com/sourcefuse/loopback4-audit-log/compare/v3.0.3...v3.1.0) (2022-05-26)


### Features

* **ci-cd:** semantic-release ([#15](https://github.com/sourcefuse/loopback4-audit-log/issues/15)) ([2979d42](https://github.com/sourcefuse/loopback4-audit-log/commit/2979d42c282286fad4d0b9602f8c0fbecd8c459d)), closes [#14](https://github.com/sourcefuse/loopback4-audit-log/issues/14)