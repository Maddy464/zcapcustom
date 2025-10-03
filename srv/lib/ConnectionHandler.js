
// srv/lib/ConnectionHandler.js
const cds = require("@sap/cds");

async function connectToExternalService(req) {
  const externalService = await cds.connect.to('GWSAMPLE');
  const tx = externalService.tx(req.query); // Create a transaction
  return tx.run(req.query); // Execute the query on the external service
}

module.exports = {
  connectToExternalService
};