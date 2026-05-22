require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// =========================
// AUTH MIDDLEWARE
// =========================

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Login required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired login" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

// =========================
// LOGIN
// =========================

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/auth/me", authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

// =========================
// CREATE JOB ORDER
// Login required
// =========================

app.post("/job_orders", authenticateUser, async (req, res) => {
  try {
    let {
      jo_number,
      jo_type,
      shipper_name,
      consignee_name,
      volume,
      shipping_line,
      vessel_name,
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
      extra_note,
      containers
    } = req.body;

    const cleanDate = (value) => value === "" ? null : value;

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
        vessel_name,
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
        vessel_name,
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

    const createdJob = newJobOrder.rows[0];

    if (containers && containers.length > 0) {
      for (const containerNumber of containers) {
        await pool.query(
          "INSERT INTO containers (job_order_id, container_number) VALUES ($1, $2)",
          [createdJob.job_order_id, containerNumber]
        );
      }
    }

    res.json(createdJob);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET ALL JOB ORDERS
// Public/read-only, hides soft-deleted rows
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

    let query = `
      SELECT jo.*,
        COALESCE(string_agg(DISTINCT c.container_number, ', '), '') as containers
      FROM job_orders jo
      LEFT JOIN containers c ON jo.job_order_id = c.job_order_id
    `;

    const queryParams = [];
    let paramCounter = 1;
    const whereConditions = ["jo.deleted_at IS NULL"];

    if (type && type !== "ALL") {
      whereConditions.push(`jo.jo_type = $${paramCounter}`);
      queryParams.push(type);
      paramCounter++;
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.toLowerCase()}%`;

      if (searchField === "all") {
        whereConditions.push(`
          (
            LOWER(jo.aju_number) LIKE $${paramCounter} OR
            LOWER(jo.jo_number) LIKE $${paramCounter + 1} OR
            LOWER(jo.shipper_name) LIKE $${paramCounter + 2} OR
            LOWER(jo.consignee_name) LIKE $${paramCounter + 3} OR
            LOWER(jo.volume) LIKE $${paramCounter + 4} OR
            EXISTS (
              SELECT 1 FROM containers c
              WHERE c.job_order_id = jo.job_order_id
              AND LOWER(c.container_number) LIKE $${paramCounter + 5}
            )
          )
        `);

        for (let i = 0; i < 6; i++) {
          queryParams.push(searchTerm);
        }

        paramCounter += 6;
      } else if (searchField === "container_number") {
        whereConditions.push(`
          EXISTS (
            SELECT 1 FROM containers c
            WHERE c.job_order_id = jo.job_order_id
            AND LOWER(c.container_number) LIKE $${paramCounter}
          )
        `);

        queryParams.push(searchTerm);
        paramCounter++;
      } else {
        const validFields = [
          "aju_number",
          "jo_number",
          "shipper_name",
          "consignee_name",
          "volume"
        ];

        if (validFields.includes(searchField)) {
          whereConditions.push(`LOWER(jo.${searchField}) LIKE $${paramCounter}`);
          queryParams.push(searchTerm);
          paramCounter++;
        }
      }
    }

    if (year && year !== "") {
      whereConditions.push(`
        (
          EXTRACT(YEAR FROM jo.eta) = $${paramCounter} OR
          EXTRACT(YEAR FROM jo.etd) = $${paramCounter} OR
          EXTRACT(YEAR FROM jo.sppb_date) = $${paramCounter}
        )
      `);

      queryParams.push(parseInt(year));
      paramCounter++;
    }

    query += " WHERE " + whereConditions.join(" AND ");
    query += " GROUP BY jo.job_order_id";

    const validSortFields = [
      "job_order_id",
      "jo_number",
      "jo_type",
      "shipper_name",
      "consignee_name",
      "volume",
      "eta",
      "etd",
      "loading_date",
      "aju_number",
      "sppb_date",
      "dooring_date",
      "port_of_discharge",
      "created_at",
      "updated_at"
    ];

    const validSort = validSortFields.includes(sort) ? sort : "eta";
    const validOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    query += ` ORDER BY jo.${validSort} ${validOrder}`;

    const allJobOrders = await pool.query(query, queryParams);
    res.json(allJobOrders.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET UNIQUE YEARS
// Public/read-only, hides soft-deleted rows
// =========================

app.get("/job_orders/years", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM eta) as year
      FROM job_orders
      WHERE eta IS NOT NULL AND deleted_at IS NULL

      UNION

      SELECT DISTINCT EXTRACT(YEAR FROM etd) as year
      FROM job_orders
      WHERE etd IS NOT NULL AND deleted_at IS NULL

      UNION

      SELECT DISTINCT EXTRACT(YEAR FROM sppb_date) as year
      FROM job_orders
      WHERE sppb_date IS NOT NULL AND deleted_at IS NULL

      ORDER BY year DESC
    `);

    const years = result.rows
      .map((row) => row.year.toString())
      .filter((year) => year !== "null");

    res.json(years);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// UPDATE JOB ORDER
// Login required
// =========================

app.put("/job_orders/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      jo_number,
      jo_type,
      shipper_name,
      consignee_name,
      volume,
      shipping_line,
      vessel_name,
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
      extra_note,
      containers
    } = req.body;

    const cleanDate = (value) => value === "" ? null : value;

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
        vessel_name = $7,
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
        AND deleted_at IS NULL
      `,
      [
        jo_number,
        jo_type,
        shipper_name,
        consignee_name,
        volume,
        shipping_line,
        vessel_name,
        port_of_loading,
        port_of_discharge,
        person_in_charge,
        cleanDate(eta),
        cleanDate(etd),
        goods,
        cleanDate(loading_date),
        cleanDate(closing_date),
        aju_number,
        cleanDate(sppb_date),
        cleanDate(dooring_date),
        extra_note,
        id
      ]
    );

    await pool.query("DELETE FROM containers WHERE job_order_id = $1", [id]);

    if (containers && containers.length > 0) {
      for (const containerNumber of containers) {
        await pool.query(
          "INSERT INTO containers (job_order_id, container_number) VALUES ($1, $2)",
          [id, containerNumber]
        );
      }
    }

    res.json("Job Order Updated");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// DELETE JOB ORDER
// Login required, soft delete only
// =========================

app.delete("/job_orders/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE job_orders
      SET deleted_at = CURRENT_TIMESTAMP,
          deleted_by = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE job_order_id = $2
        AND deleted_at IS NULL
      `,
      [req.user.user_id, id]
    );

    res.json("Job Order Deleted");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET SINGLE JOB ORDER
// Public/read-only, hides soft-deleted rows
// =========================

app.get("/job_orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT jo.*,
        COALESCE(string_agg(DISTINCT c.container_number, ', '), '') as containers
      FROM job_orders jo
      LEFT JOIN containers c ON jo.job_order_id = c.job_order_id
      WHERE jo.job_order_id = $1
        AND jo.deleted_at IS NULL
      GROUP BY jo.job_order_id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Job order not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET DELETED JOB ORDERS
// Admin only
// =========================

app.get("/admin/deleted-job-orders", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        jo.*,
        u.username AS deleted_by_username,
        u.full_name AS deleted_by_full_name
      FROM job_orders jo
      LEFT JOIN users u ON jo.deleted_by = u.user_id
      WHERE jo.deleted_at IS NOT NULL
      ORDER BY jo.deleted_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// RESTORE DELETED JOB ORDER
// Admin only
// =========================

app.put("/admin/job-orders/:id/restore", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE job_orders
      SET deleted_at = NULL,
          deleted_by = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE job_order_id = $1
      `,
      [id]
    );

    res.json("Job Order Restored");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// ADMIN TEST ROUTE
// =========================

app.get("/admin/test", authenticateUser, requireAdmin, async (req, res) => {
  res.json({
    message: "Admin route works",
    user: req.user
  });
});

// =========================
// SERVE STATIC FILES
// =========================

const distPath = process.pkg
  ? path.join(path.dirname(process.execPath), "dist")
  : path.join(__dirname, "dist");

if (fs.existsSync(distPath)) {
  console.log("Serving React frontend from:", distPath);

  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (
      req.path.startsWith("/job_orders") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/admin")
    ) {
      return next();
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("Warning: dist folder not found at:", distPath);

  app.get("/", (req, res) => {
    res.send("Backend is running! But frontend build not found.");
  });
}

// =========================
// LOCAL IP HELPER
// =========================

function getLocalIp() {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return "localhost";
}

// =========================
// START SERVER
// =========================

const PORT = 5000;
const localIp = getLocalIp();

app.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("GST Job Order Server Running!");
  console.log("========================================");
  console.log(`Local access:    http://localhost:${PORT}`);
  console.log(`Network access:  http://${localIp}:${PORT}`);
  console.log("========================================");
  console.log("Share this URL with employees:");
  console.log(`   http://${localIp}:${PORT}`);
  console.log("========================================");
});