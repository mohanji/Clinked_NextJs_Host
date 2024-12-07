const { Client } = require("@elastic/elasticsearch");

const configPropName = "elasticsearch-url";

const cfg = {
  "elasticsearch-url": process.env.ES_URL,
};

let connection;

/**
 * pre initiate the connection with elastic search and
 * preserve the connection for future use.
 * TODO: We need to check how this connection will behave when
 * connection expired or gone during run time. In other way round,
 * will connection restored when server is back?
 * @return {object} elastic search connection object
 */
const getConnection = () =>
  new Promise((resolve, reject) => {
    if (connection) return resolve(connection);
    const elasticSearchURL = cfg[configPropName];
    if (!elasticSearchURL) {
      throw new Error(`${configPropName} config is missing`);
    }
    connection = new Client({
      node: elasticSearchURL,
      requestTimeout: 6000,
    });
    connection
      .ping({})
      .then((available) => {
        if (available) {
          console.info("Elastic search connection is OK");
          return resolve(connection);
        } else {
          return reject(new Error("elasticsearch cluster is down!"));
        }
      })
      .catch((e) => {
        console.error(e);
        return reject(new Error("elasticsearch cluster is down!"));
      });
  });

module.exports.connect = getConnection;
