export const useFetch = () => {
  const parameters = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const url = 'http://wwww.mariyavladimir.ru/api/records'

  return {
    get(id) {
      const resultUrl = id ? `${url}/${id}` : url

      return fetch(resultUrl, parameters).then((data) => data.json())
    },

    put(uuid, body) {
      return fetch(`${url}/${uuid}`, {
        ...parameters,
        method: 'PUT',
        body: JSON.stringify(body),
      }).then((data) => data.json())
    },

    post(body) {
      return fetch(url, {
        ...parameters,
        method: 'POST',
        body: JSON.stringify(body),
      }).then((data) => data.json())
    },

    delete(id) {
      return fetch(`${url}/${id}`, {
        ...parameters,
        method: 'DELETE',
      }).then((data) => data.json())
    },
  }
}
