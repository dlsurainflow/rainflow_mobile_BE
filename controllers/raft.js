const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { Pool } = require("pg");

const pool = new Pool({
  user: "tammy",
  host: "RainFLOW.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

exports.returnCharts = async (req, res) => {
  var sql_FD1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'FD1' and "msgTime" > current_date - interval '1' day;`;
  var sql_TMP1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'TMP1' and "msgTime" > current_date - interval '1' day;`;
  var sql_RA1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'RA1' and "msgTime" > current_date - interval '1' day;`;
  var sql_PR1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'PR1' and "msgTime" > current_date - interval '1' day;`;
  var sql_HU1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'HU1' and "msgTime" > current_date - interval '1' day;`;
  var sql_WL1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'WL1' and "msgTime" > current_date - interval '1' day;`;

  var FD1 = await pool.query(sql_FD1);
  var TMP1 = await pool.query(sql_TMP1);
  var RA1 = await pool.query(sql_RA1);
  var PR1 = await pool.query(sql_PR1);
  var HU1 = await pool.query(sql_HU1);
  var WL1 = await pool.query(sql_WL1);

  res.status(200).json({
    FD1: FD1.rows,
    TMP1: TMP1.rows,
    RA1: RA1.rows,
    PR1: PR1.rows,
    HU1: HU1.rows,
    WL1: WL1.rows,
  });
};

exports.returnChartsByDate = async (req, res) => {
  // 2020-08-15
  // select data.value->'time'  as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '16e15ed39244120e8be31e00e193b009d9e1' and data.key = 'FD1' and "msgTime" >= '2020-11-20' and "msgTime" < '2020-11-21';
  var sql_FD1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'FD1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;
  var sql_TMP1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'TMP1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;
  var sql_RA1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'RA1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;
  var sql_PR1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'PR1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;
  var sql_HU1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'HU1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;
  var sql_WL1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${req.params.deviceID}' and data.key = 'WL1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}';`;

  var FD1 = await pool.query(sql_FD1);
  var TMP1 = await pool.query(sql_TMP1);
  var RA1 = await pool.query(sql_RA1);
  var PR1 = await pool.query(sql_PR1);
  var HU1 = await pool.query(sql_HU1);
  var WL1 = await pool.query(sql_WL1);

  res.status(200).json({
    FD1: FD1.rows,
    TMP1: TMP1.rows,
    RA1: RA1.rows,
    PR1: PR1.rows,
    HU1: HU1.rows,
    WL1: WL1.rows,
  });
};
