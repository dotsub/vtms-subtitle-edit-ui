#!/bin/bash
GITHUB_TOKEN=$CD_GITHUB_TOKEN

#check for ESLint violations
if (grep '<error' build/eslint.xml 1> /dev/null 2>&1) then
  sumEslint=$(cat build/eslint.xml | grep -o '<error' | wc -l)
  echo "ESLint found "${sumEslint}" issues!";
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "travis-ci/ESLint", "description": "ESLint found '"${sumEslint}"' issues!"}' https://api.github.com/repos/dotsub/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "travis-ci/ESLint", "description": "ESLint Passed"}' https://api.github.com/repos/dotsub/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
fi

# Check console outputs from JS test suite
CONSOLE_PROBLEMS=$(cat */build/js-build.log | \
  # THESE ARE MOST WIDE SPREAD:
  # https://dotsub.atlassian.net/browse/VTMS-3857:
  pcregrep -Mv 'console.error.*\n.*Warning: An update to.*inside a test'| \
  # https://dotsub.atlassian.net/browse/VTMS-3843:
  pcregrep -Mv 'console.warn.*\n.*Warning: componentWillMount has been renamed' | \
  # https://dotsub.atlassian.net/browse/VTMS-3844:
  pcregrep -Mv 'console.warn.*\n.*Warning: componentWillReceiveProps has been renamed' | \

  # https://dotsub.atlassian.net/browse/VTMS-3842:
  pcregrep -Mv 'console.warn.*\n.*Warning: React.createFactory\(\) is deprecated' | \
  # https://dotsub.atlassian.net/browse/VTMS-3845
  pcregrep -Mv 'console.error.*\n.*Warning: Cannot update a component' | \
  # https://dotsub.atlassian.net/browse/VTMS-3847:
  pcregrep -Mv 'console.error.*\n.*Warning: React does not recognize the' | \
  # https://dotsub.atlassian.net/browse/VTMS-3848:
  pcregrep -Mv 'console.error.*\n.*Warning: You provided a' | \
  # https://dotsub.atlassian.net/browse/VTMS-3849:
  pcregrep -Mv 'console.error.*\n.*Warning: render\(\): Rendering components directly into document.body is discouraged' | \
  # https://dotsub.atlassian.net/browse/VTMS-3850:
  pcregrep -Mv 'console.error.*\n.*Error: Error: connect' | \
  # https://dotsub.atlassian.net/browse/VTMS-3851:
  pcregrep -Mv 'console.error.*\n.*Warning: Failed prop type:' | \
  # https://dotsub.atlassian.net/browse/VTMS-3852:
  pcregrep -Mv 'console.error.*\n.*Warning: render\(\.\.\.\): Replacing React-rendered children with a new root component' | \
  # https://dotsub.atlassian.net/browse/VTMS-3853:
  pcregrep -Mv 'console.error.*\n.*Warning: A component is changing a controlled input to be uncontrolled' | \
  # https://dotsub.atlassian.net/browse/VTMS-3857:
  pcregrep -Mv 'console.error.*\n.*Warning: A component is changing an uncontrolled input to be controlled' | \
  # https://dotsub.atlassian.net/browse/VTMS-3859:
  pcregrep -Mv 'console.log.*\n.*base\.preprocess\(\) File' | \
  # https://dotsub.atlassian.net/browse/VTMS-3860:
  pcregrep -Mv 'console.error.*\n.*Unexpected key ' | \
  # https://dotsub.atlassian.net/browse/VTMS-3861:
  pcregrep -Mv 'console.error.*\n.*Warning: Expected `onClick` listener to be a function' | \
  # https://dotsub.atlassian.net/browse/VTMS-3862:
  pcregrep -Mv 'console.error.*\n.*Warning: useLayoutEffect does nothing on the server' | \

  # https://dotsub.atlassian.net/browse/VTMS-3863:
  pcregrep -Mv 'console.warn.*\n.*A response was recieved but no data entry was found' | \
  pcregrep -Mv 'console.warn.*\n.*Please see https:' | \

  # https://dotsub.atlassian.net/browse/VTMS-3864:
  pcregrep -Mv 'console.warn.*\n.*is missing in the.*defaultValue' | \
  # https://dotsub.atlassian.net/browse/VTMS-3865:
  pcregrep -Mv 'console.warn.*\n.*Global fetch is deprecated and will be unsupported in a future version' | \
  # https://dotsub.atlassian.net/browse/VTMS-3866:
  pcregrep -Mv 'console.error.*\n.*Warning: Received `false` for a non-boolean attribute' | \
  # https://dotsub.atlassian.net/browse/VTMS-3867:
  pcregrep -Mv 'console.error.*\n.*Warning: Unknown event handler property' | \
  # https://dotsub.atlassian.net/browse/VTMS-3868:
  pcregrep -Mv 'console.warn.*\n.*Deprecation warning:' | \
  # https://dotsub.atlassian.net/browse/VTMS-3869:
  pcregrep -Mv 'console.error.*\n.*Warning: Each child in a list should have a unique' | \
  # https://dotsub.atlassian.net/browse/VTMS-3870:
  pcregrep -Mv 'console.error.*\n.*Warning: validateDOMNesting' | \
  # https://dotsub.atlassian.net/browse/VTMS-3871:
  pcregrep -Mv 'console.warn.*\n.*Warning: You cannot change <Router history>' | \
  # https://dotsub.atlassian.net/browse/VTMS-3872:
  pcregrep -Mv 'console.error.*\n.*Warning: It looks like you.*re using the wrong act' | \
  # https://dotsub.atlassian.net/browse/VTMS-3873:
  pcregrep -Mv 'console.error.*\n.*Warning: Failed context type: The context ' | \
  # https://dotsub.atlassian.net/browse/VTMS-3874:
  pcregrep -Mv 'console.error.*\n.*Warning: Can.*t perform a React state update on an unmounted component' | \

  # https://dotsub.atlassian.net/browse/VTMS-3876:
  pcregrep -Mv 'console.error.*\n.*Warning: ErrorBoundary: Error boundaries should implement' | \
  pcregrep -Mv 'console.log.*\n.*App error boundary Error: testing error boundary' | \
  pcregrep -Mv 'console.error.*\n.*The above error occurred in the' | \
  pcregrep -Mv 'console.error.*\n.*Error: Uncaught' | \

  # Remove `c` from following command to troubleshoot which issue was not caught by above suppressions
  pcregrep -Mc '(\A\s*console\..*\n.*)|(Network Error)|(ECONNREFUSED)|(UnhandledPromiseRejectionWarning)')

if (( CONSOLE_PROBLEMS > 0 )); then
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "travis-ci/console-issues", "description": "Found '"${CONSOLE_PROBLEMS}"' browser console issues!"}' https://api.github.com/repos/dotsub/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
  echo $CONSOLE_PROBLEMS
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "travis-ci/console-issues", "description": "Browser console issues check passed"}' https://api.github.com/repos/dotsub/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
  echo OK
fi
