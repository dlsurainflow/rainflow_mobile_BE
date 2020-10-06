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
      const time = new Date().toISOString();
      var queryString =
        'INSERT INTO "Users" ("username", "email", "password", "roleIntID", "tenantID", "createdAt", "updatedAt") VALUES (' +
        `'${results.rows[i].username}', '${results.rows[i].email}', '${results.rows[i].password}', '${results.rows[i].roleIntID}', '${results.rows[i].tenantID}', '${time}', '${time}');`;
      // var queryString =
      //   'INSERT INTO USERS (username, email, password, roleIntID, tenantID, createdAt, updatedAt") VALUES (' +
      //   `${results.rows[i].username}, ${results.rows[i].email}, ${results.rows[i].password}, ${results.rows[i].roleIntID}, ${results.rows[i].tenantID}, ${results.rows[i].createAt}, ${results.rows[i].updateAt});`;
      console.log(queryString);
      var query = client2.query(queryString, function (error, result) {
        if (error) console.log(error);
        else console.log(result);
      });
    }
  }
});
