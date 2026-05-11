const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const path = require('path');
const fs = require('fs');

// middleware
app.use(cors());
app.use(express.json());

// =========================
// CREATE JOB ORDER
// =========================

app.post("/job_orders", async (req, res) => {
  try {

    let {
      jo_number,
      jo_type,

      shipper_name,
      consignee_name,
      volume,
      shipping_line,
      voyage_name,
      port_of_loading,
      port_of_discharge,
      person_in_charge,

      eta,
      etd,

      goods,

      loading_date,
      closing_date,

      aju_number,
      sppb_date,
      dooring_date,

      extra_note
    } = req.body;

    const cleanDate = (value) => {
      return value === "" ? null : value;
    };

    eta = cleanDate(eta);
    etd = cleanDate(etd);

    loading_date = cleanDate(loading_date);
    closing_date = cleanDate(closing_date);

    sppb_date = cleanDate(sppb_date);
    dooring_date = cleanDate(dooring_date);

    const newJobOrder = await pool.query(
      `
      INSERT INTO job_orders (
        jo_number,
        jo_type,

        shipper_name,
        consignee_name,
        volume,
        shipping_line,
        voyage_name,
        port_of_loading,
        port_of_discharge,
        person_in_charge,

        eta,
        etd,

        goods,

        loading_date,
        closing_date,

        aju_number,
        sppb_date,
        dooring_date,

        extra_note
      )

      VALUES (
        $1, $2,
        $3, $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12,
        $13,
        $14, $15,
        $16, $17, $18,
        $19
      )

      RETURNING *
      `,
      [
        jo_number,
        jo_type,

        shipper_name,
        consignee_name,
        volume,
        shipping_line,
        voyage_name,
        port_of_loading,
        port_of_discharge,
        person_in_charge,

        eta,
        etd,

        goods,

        loading_date,
        closing_date,

        aju_number,
        sppb_date,
        dooring_date,

        extra_note
      ]
    );

    res.json(newJobOrder.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET ALL JOB ORDERS WITH FILTERING, SEARCH, SORTING
// =========================

app.get("/job_orders", async (req, res) => {
  try {
    const {
      search = "",
      searchField = "all",
      year = "",
      sort = "eta",
      order = "ASC",
      type = ""
    } = req.query;

    let query = "SELECT * FROM job_orders";
    const queryParams = [];
    let paramCounter = 1;
    const whereConditions = [];

    if (type && type !== "ALL") {
      whereConditions.push(`jo_type = $${paramCounter}`);
      queryParams.push(type);
      paramCounter++;
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.toLowerCase()}%`;
      
      if (searchField === "all") {
        whereConditions.push(`
          (
            LOWER(aju_number) LIKE $${paramCounter} OR
            LOWER(jo_number) LIKE $${paramCounter + 1} OR
            LOWER(shipper_name) LIKE $${paramCounter + 2} OR
            LOWER(consignee_name) LIKE $${paramCounter + 3} OR
            LOWER(volume) LIKE $${paramCounter + 4}
          )
        `);
        for (let i = 0; i < 5; i++) {
          queryParams.push(searchTerm);
        }
        paramCounter += 5;
      } else {
        const validFields = ["aju_number", "jo_number", "shipper_name", "consignee_name", "volume"];
        if (validFields.includes(searchField)) {
          whereConditions.push(`LOWER(${searchField}) LIKE $${paramCounter}`);
          queryParams.push(searchTerm);
          paramCounter++;
        }
      }
    }

    if (year && year !== "") {
      whereConditions.push(`
        (
          EXTRACT(YEAR FROM eta) = $${paramCounter} OR
          EXTRACT(YEAR FROM etd) = $${paramCounter} OR
          EXTRACT(YEAR FROM sppb_date) = $${paramCounter}
        )
      `);
      queryParams.push(parseInt(year));
      paramCounter++;
    }

    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }

    const validSortFields = [
      "job_order_id", "jo_number", "jo_type", "shipper_name", 
      "consignee_name", "volume", "eta", "etd", "loading_date",
      "aju_number", "sppb_date", "dooring_date", "port_of_discharge",
      "created_at", "updated_at"
    ];
    
    const validSort = validSortFields.includes(sort) ? sort : "eta";
    const validOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";
    
    query += ` ORDER BY ${validSort} ${validOrder}`;

    console.log("Executing query:", query);
    console.log("With params:", queryParams);

    const allJobOrders = await pool.query(query, queryParams);
    res.json(allJobOrders.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET UNIQUE YEARS FOR FILTER
// =========================

app.get("/job_orders/years", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM eta) as year FROM job_orders WHERE eta IS NOT NULL
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM etd) as year FROM job_orders WHERE etd IS NOT NULL
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM sppb_date) as year FROM job_orders WHERE sppb_date IS NOT NULL
      ORDER BY year DESC
    `);
    
    const years = result.rows.map(row => row.year.toString()).filter(year => year !== "null");
    res.json(years);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// UPDATE JOB ORDER
// =========================

app.put("/job_orders/:id", async (req, res) => {
  try {

    const { id } = req.params;

    const {
      jo_number,
      jo_type,

      shipper_name,
      consignee_name,
      volume,
      shipping_line,
      voyage_name,
      port_of_loading,
      port_of_discharge,
      person_in_charge,

      eta,
      etd,

      goods,

      loading_date,
      closing_date,

      aju_number,
      sppb_date,
      dooring_date,

      extra_note
    } = req.body;

    const cleanDate = (value) => {
      return value === "" ? null : value;
    };

    const cleanEta = cleanDate(eta);
    const cleanEtd = cleanDate(etd);
    const cleanLoadingDate = cleanDate(loading_date);
    const cleanClosingDate = cleanDate(closing_date);
    const cleanSppbDate = cleanDate(sppb_date);
    const cleanDooringDate = cleanDate(dooring_date);

    await pool.query(
      `
      UPDATE job_orders

      SET
        jo_number = $1,
        jo_type = $2,

        shipper_name = $3,
        consignee_name = $4,
        volume = $5,
        shipping_line = $6,
        voyage_name = $7,
        port_of_loading = $8,
        port_of_discharge = $9,
        person_in_charge = $10,

        eta = $11,
        etd = $12,

        goods = $13,

        loading_date = $14,
        closing_date = $15,

        aju_number = $16,
        sppb_date = $17,
        dooring_date = $18,

        extra_note = $19,

        updated_at = CURRENT_TIMESTAMP

      WHERE job_order_id = $20
      `,
      [
        jo_number,
        jo_type,

        shipper_name,
        consignee_name,
        volume,
        shipping_line,
        voyage_name,
        port_of_loading,
        port_of_discharge,
        person_in_charge,

        cleanEta,
        cleanEtd,

        goods,

        cleanLoadingDate,
        cleanClosingDate,

        aju_number,
        cleanSppbDate,
        cleanDooringDate,

        extra_note,

        id
      ]
    );

    res.json("Job Order Updated");

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// DELETE JOB ORDER
// =========================

app.delete("/job_orders/:id", async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM job_orders WHERE job_order_id = $1",
      [id]
    );

    res.json("Job Order Deleted");

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// SERVE STATIC FILES (REACT VITE BUILD) - FIXED VERSION
// =========================

// Use 'dist' folder (Vite default)
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  console.log('✓ Serving React frontend from:', distPath);
  
  // Serve static files first
  app.use(express.static(distPath));
  
  // For client-side routing - serve index.html for any non-API request
  // Using a middleware function instead of app.get('*')
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/job_orders')) {
      return next();
    }
    // Send index.html for all other routes
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
} else {
  console.log('⚠ Warning: dist folder not found at:', distPath);
  console.log('Please run "npm run build" in your frontend folder and copy the "dist" folder here');
  app.get('/', (req, res) => {
    res.send('Backend is running! But frontend build not found. Run "npm run build" first.');
  });
}

// Helper function to get local IP address
function getLocalIp() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// =========================
// START SERVER
// =========================
const PORT = 5000;
const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`✅ GST Job Order Server Running!`);
  console.log(`========================================`);
  console.log(`📍 Local access:    http://localhost:${PORT}`);
  console.log(`📍 Network access:  http://${localIp}:${PORT}`);
  console.log(`========================================`);
  console.log(`📱 Share this URL with employees:`);
  console.log(`   http://${localIp}:${PORT}`);
  console.log(`========================================`);
});