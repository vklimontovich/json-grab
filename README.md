# Grab

Grab Node JS library for calling JSON-based HTTP-apis. Grab wraps `fetch()` and takes care about JSON serialization / deserialization and error handling

## Installation

`npm install json-grab` or `yarn add json-grab` or `pnpm add json-grab`

## Example

Using fetch

```javascript
async function getDataFromServer() {
    const result = await fetch(url, {method: "POST", body: JSON.stringify(body)}
    if (!result.ok) {
       throw new Error(`Can't post data to ${url} - ${result.statusText}`)
    }
    return await result.json();
}
```

Using grab

```javascript
async function getDataFromServer() {
   return await grab(url, { body })
}
```

## NodeJS vs Browser

`grab` works in Browser and NodeJS. For node JS you need to provide a fetch implementation:

```
import fetch from 'node-fetch';
import grab from 'json-grap';

grab.setup({fetch})

```



## Feaures

* *API compatibility*. Grab API is compatible with fetch 
* *Smart defaults*. For example, you don't need to set an HTTP method if you set a request body. Grab is smart enough 
* *Error handling*. Excellent error handling with detailed, clear error messages
* *Timeouts*. Grab can handle timeouts: `await grab(url, { body, timeoutMs: 2000 })`
* 

## Future features

### Templates

```
import fetch from 'cross-fetch';

const myGrab = grab.template({headers: {'Authorization': `Bearer XXXX`}, fetchImpl: fetch })
```

