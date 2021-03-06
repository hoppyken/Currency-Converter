

const storeName = 'currencyConverterDB-io';
/* 
  class for controlling IndexedDB storage 
*/
class LocalIndexedStorage {

  static open(dbName='exchangeCurrency', version=1) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        const message = "This browser doesn't support a stable version of IndexedDB. This app won't work completely offline.";
        throw new Error(message);
      }
      const request = window.indexedDB.open(dbName, version);
      request.addEventListener('error', (error) => {reject(error)});
      request.addEventListener('success', (event) => {
        console.log(dbName, 'IndexedDB opened');
        const { target: { result } } = event;
        resolve(result);
      })
      request.addEventListener('upgradeneeded', (event) => {
        console.log('Upgrade done', event.result)
        const { target: { result } } = event;
        const db = result;
        db.createObjectStore(storeName, { keyPath: 'id' });
      });
    })
  }

  /* 
    setExchangeRate() : to insert new exchange rate into IndexDB
  */
  
  static setExchangeRate(key, value, db) {
    let dates = getDate();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      transaction.addEventListener('complete', () => {
        console.log('Data Stored');
      });
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.put({ id: key, value, dates });
      request.addEventListener('error', (event) => {
        reject(event.error)
      });
      request.addEventListener('success', (event) => {
        console.log(event.target.result)
        resolve(event.target.result === key)
      });
    });
  }
/* 
  removeExchangeRate() : to delete/remove from database.
*/
  static removeExchangeRate(key, db) {
    return new Promise((resolve, reject) => {
      const request = db.transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .delete(key);
      request.addEventListener('error',(event) => {reject(event.error)});
      request.addEventListener('success', () => {resolve(true)});
    });
  }
/*
  getExchangeRate() : to get date from IndexDB
*/
  static getExchangeRate(key, db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName);
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);

      request.addEventListener('error', (event) => {
        reject(event.error)
      });

      request.addEventListener('success', (event) => {
        resolve(event.target.result)
      });

    });
  }
}

// explicitly export class to global scope
window.LocalIndexedStorage = LocalIndexedStorage;
