let db;


// Create a new db request for a "budget" database.
const request = indexedDB.open('BudgetTracker', 1);

request.onupgradeneeded = function (e) {
  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetTracker', { autoIncrement: true });
  }
};

request.onerror = function (e) {
};

function checkDatabase() {
  console.log('check db invoked');

  let transaction = db.transaction(['pending'], 'readwrite');

  const store = transaction.objectStore('pending');

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(['pending'], 'readwrite');

            const currentStore = transaction.objectStore('pending');

            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  const transaction = db.transaction(['pending'], 'readwrite');

  const store = transaction.objectStore('pending');

  store.add(record);
};

window.addEventListener('online', checkDatabase);