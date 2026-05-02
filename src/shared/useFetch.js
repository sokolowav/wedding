const parseJsonResponse = async (res) => {
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  if (!text) {
    throw new Error('Пустой ответ сервера')
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Ответ сервера не JSON')
  }
}

export const useFetch = () => {
  const parameters = {
    headers: {
      'Content-Type': 'application/json',
    },
    /** иначе браузер даёт 304 с пустым телом → json() падает и ломает UI */
    cache: 'no-store',
  }

  /** Same-origin: работает на проде (HTTPS) и не ловит mixed content */
  const url = '/api/records'

  return {
    get(id) {
      const resultUrl = id ? `${url}/${id}` : url

      return fetch(resultUrl, { ...parameters }).then(parseJsonResponse)
    },

    put(uuid, body) {
      return fetch(`${url}/${uuid}`, {
        ...parameters,
        method: 'PUT',
        body: JSON.stringify(body),
      }).then(parseJsonResponse)
    },

    post(body) {
      return fetch(url, {
        ...parameters,
        method: 'POST',
        body: JSON.stringify(body),
      }).then(parseJsonResponse)
    },

    delete(id) {
      return fetch(`${url}/${id}`, {
        ...parameters,
        method: 'DELETE',
      }).then(parseJsonResponse)
    },
  }
}
