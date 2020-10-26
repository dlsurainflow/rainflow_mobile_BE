const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { Pool, Client } = require("pg");

const client = new Client({
  user: "tammy",
  host: "RainFLOW.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

exports.returnCharts = async (req, res) => {
  client
    .connect()
    .then(async () => {
      console.log("Successfully connected to ActorCloud.");
      // var sql = `SELECT * FROM devices where "deviceID" = '${req.params.deviceID}' AND "showOnMap" = 1`;
      var sql_FD1 = `select data.value->'time'  as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'FD1' and "msgTime" > current_date - interval '1' day;`;
      var sql_TMP1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'TMP1' and "msgTime" > current_date - interval '1' day;`;
      var sql_RA1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'RA1' and "msgTime" > current_date - interval '1' day;`;
      var sql_PR1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'PR1' and "msgTime" > current_date - interval '1' day;`;
      var sql_HU1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'HU1' and "msgTime" > current_date - interval '1' day;`;
      var FD1 = await client.query(sql_FD1);
      var TMP1 = await client.query(sql_TMP1);
      var RA1 = await client.query(sql_RA1);
      var PR1 = await client.query(sql_PR1);
      var HU1 = await client.query(sql_HU1);
      res.status(200).json({
        FD1: FD1.rows,
        TMP1: TMP1.rows,
        RA1: RA1.rows,
        PR1: PR1.rows,
        HU1: HU1.rows,
      });

      await client.end();
    })
    .catch((err) => console.error("Connection error", err.stack));
};
