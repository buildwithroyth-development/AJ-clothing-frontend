import firebaseApi from './firebase'

// All data access goes through Firebase Realtime Database.
// Paths keep the old REST-style shape (e.g. '/products/', '/sales/') so pages don't need to change.
export const api = {
  get:    (path)        => firebaseApi.get(path),
  post:   (path, body)  => firebaseApi.post(path, body),
  patch:  (path, body)  => firebaseApi.patch(path, body),
  delete: (path)        => firebaseApi.delete(path),
}

export default api
