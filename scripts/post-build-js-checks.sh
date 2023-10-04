#!/bin/bash
GITHUB_TOKEN=$CD_GITHUB_TOKEN

#check for ESLint violations
if (grep '<error' build/eslint.xml 1> /dev/null 2>&1) then
  sumEslint=$(cat build/eslint.xml | grep -o '<error' | wc -l)
  echo "ESLint found "${sumEslint}" issues!";
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "travis-ci/ESLint", "description": "ESLint found '"${sumEslint}"' issues!"}' https://api.github.com/repos/lkrnac/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "travis-ci/ESLint", "description": "ESLint Passed"}' https://api.github.com/repos/lkrnac/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
fi

# Check console outputs from JS test suite
CONSOLE_PROBLEMS=$(cat */build/js-build.log | \
  # THESE ARE MOST WIDE SPREAD -> TODO to fix them:
  pcregrep -Mv 'console.error.*\n.*Warning: An update to.*inside a test'| \
  pcregrep -Mv 'console.warn.*\n.*Warning: componentWillMount has been renamed' | \
  pcregrep -Mv 'console.warn.*\n.*Warning: componentWillReceiveProps has been renamed' | \

  pcregrep -Mv 'console.warn.*\n.*Warning: React.createFactory\(\) is deprecated' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Cannot update a component' | \
  pcregrep -Mv 'console.error.*\n.*Warning: React does not recognize the' | \
  pcregrep -Mv 'console.error.*\n.*Warning: You provided a' | \
  pcregrep -Mv 'console.error.*\n.*Warning: render\(\): Rendering components directly into document.body is discouraged' | \
  pcregrep -Mv 'console.error.*\n.*Error: Error: connect' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Failed prop type:' | \
  pcregrep -Mv 'console.error.*\n.*Warning: render\(\.\.\.\): Replacing React-rendered children with a new root component' | \
  pcregrep -Mv 'console.error.*\n.*Warning: A component is changing a controlled input to be uncontrolled' | \
  pcregrep -Mv 'console.error.*\n.*Warning: A component is changing an uncontrolled input to be controlled' | \
  pcregrep -Mv 'console.log.*\n.*base\.preprocess\(\) File' | \
  pcregrep -Mv 'console.error.*\n.*Unexpected key ' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Expected `onClick` listener to be a function' | \
  pcregrep -Mv 'console.error.*\n.*Warning: useLayoutEffect does nothing on the server' | \

  pcregrep -Mv 'console.warn.*\n.*A response was recieved but no data entry was found' | \
  pcregrep -Mv 'console.warn.*\n.*Please see https:' | \

  pcregrep -Mv 'console.warn.*\n.*is missing in the.*defaultValue' | \
  pcregrep -Mv 'console.warn.*\n.*Global fetch is deprecated and will be unsupported in a future version' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Received `false` for a non-boolean attribute' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Unknown event handler property' | \
  pcregrep -Mv 'console.warn.*\n.*Deprecation warning:' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Each child in a list should have a unique' | \
  pcregrep -Mv 'console.error.*\n.*Warning: validateDOMNesting' | \
  pcregrep -Mv 'console.warn.*\n.*Warning: You cannot change <Router history>' | \
  pcregrep -Mv 'console.error.*\n.*Warning: It looks like you.*re using the wrong act' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Failed context type: The context ' | \
  pcregrep -Mv 'console.error.*\n.*Warning: Can.*t perform a React state update on an unmounted component' | \

  pcregrep -Mv 'console.error.*\n.*Warning: ErrorBoundary: Error boundaries should implement' | \
  pcregrep -Mv 'console.log.*\n.*App error boundary Error: testing error boundary' | \
  pcregrep -Mv 'console.error.*\n.*The above error occurred in the' | \
  pcregrep -Mv 'console.error.*\n.*Error: Uncaught' | \

  # Remove `c` from following command to troubleshoot which issue was not caught by above suppressions
  pcregrep -Mc '(\A\s*console\..*\n.*)|(Network Error)|(ECONNREFUSED)|(UnhandledPromiseRejectionWarning)')

if (( CONSOLE_PROBLEMS > 0 )); then
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "travis-ci/console-issues", "description": "Found '"${CONSOLE_PROBLEMS}"' browser console issues!"}' https://api.github.com/repos/lkrnac/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
  echo $CONSOLE_PROBLEMS
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "travis-ci/console-issues", "description": "Browser console issues check passed"}' https://api.github.com/repos/lkrnac/manucap/statuses/${TRAVIS_COMMIT} > /dev/null
  echo OK
fi
