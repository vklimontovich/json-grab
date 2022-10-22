# Grab

Grab Node JS library for calling JSON-based HTTP API. Grab wraps `fetch()` and takes care of JSON serialization/deserialization and error handling.

## Installation

`npm install json-grab` or `yarn add json-grab` or `pnpm add json-grab`

## Example

With `fetch`:

```typescript
async function getDataFromServer() {
    const result = await fetch(url + `?${param}=${value}`, {
      method: "POST", 
      body: JSON.stringify(body), 
      headers: {
        "Content-Type": "application/json", 
        "Accept": "application/json"}
    });
    if (!result.ok) {
       throw new Error(`Can't post data to ${url} - ${result.statusText}`)
    }
    return await result.json();
}
```

With `grab`:

```typescript
async function getDataFromServer() {
   return await grab(url, { body, query: {param: "value"} })
}
```

## Works in NodeJS  Browser

`grab` works in Browser without additional configuration. In NodeJS you need to provide `fetch` implementation. For example, you can use `node-fetch`:

```javascript
import fetch from 'node-fetch';
import grab from 'json-grap';

grab.setup({fetch})
```

## Features

* *API compatibility*. Grab API is compatible with fetch 
* *Smart defaults*. For example, you don't need to set an HTTP method if you set a request body. Grab is smart enough to set `POST` method in this case. Also, 
it sets `Content-Type` and `Accept` headers to `application/json` automatically
* *Error handling*. Excellent error handling with detailed, clear error messages
* *No more string concatenation for URLs params*. Use: `grab(url, {query: {a: 1, b: 2}})`

## Future features

### Timeouts

```typescript
await grab(url, { body, timeoutMs: 2000 })
```

### Templates

```typescript
import fetch from 'cross-fetch';

const myGrab = grab.template({headers: {'Authorization': `Bearer XXXX`}, fetchImpl: fetch })
//no need to set authorization header for each request
const result = await myGrab(url, { body })
```

