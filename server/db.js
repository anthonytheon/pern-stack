const Pool = require("pg").Pool;

const pool = new Pool({
    user: "employee",
    password: "employee123",
    host: "localhost",
    port: "5432",
    database: "gst_job_order"

});

module.exports = pool;