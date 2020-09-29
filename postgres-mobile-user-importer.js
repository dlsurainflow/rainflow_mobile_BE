const { Client } = require("pg");

const client = new Client({
  user: "tammy",
  host: "rainflow.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

const client2 = new Client({
  user: "tammy",
  host: "rainflow.live",
  database: "rainflow",
  password: "Inmediasres8!",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Successfully connected to RainFLOW ActorCloud."))
  .catch((err) => console.error("Connection error", err.stack));

client2
  .connect()
  .then(() => console.log("Successfully connected to RainFLOW rainflow."))
  .catch((err) => console.error("Connection error", err.stack));

client.query("SELECT * FROM users", (error, results) => {
  if (error) {
    throw error;
  } else {
    console.log(results.rows);
    for (var i = 0; i < results.rows.length; i++) {
      var queryString =
        "INSERT INTO mobile_user (\"username\", \"email\", \"password\", \"roleIntID\", \"tenantID\") VALUES (" +
        `'${results.rows[i].username}', '${results.rows[i].email}', '${results.rows[i].password}', '${results.rows[i].roleIntID}', '${results.rows[i].tenantID}');`;

      console.log(queryString);
      var query = client2.query(queryString, function (error, result) {
        console.log(result);
      });
    }
  }
});
