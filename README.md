# manucap

[![NPM](https://img.shields.io/npm/v/manucap.svg)](https://www.npmjs.com/package/manucap)

## Install

```bash
npm install --save manucap
```

## Usage

```tsx
import * as React from 'react'

import ManuCap from "manucap";

const Example = props => (
    <ManuCap.VideoPlayer
        id="testvpid"
        poster="http://media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
        mp4="http://media-encoded.s3.amazonaws.com/1/14/14.mp4"
    />
);
```

## Development

### Auto-reload in browser
When code is changed, it will rerender components in browser
```bash
npm run autoreload
```

### Auto-build library
When code is changed, it will automatically create distribution package
```bash
npm start
```

### Continuous unit testing
When code is changed, all tests are rerun
```bash
npm test
```
