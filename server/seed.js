// ============================================================
// MASSIVE DATABASE SEEDER - 100+ Job Orders
// Run with: npm run seed:big
// ============================================================

const { Pool } = require('pg');

// Database configuration - UPDATE THESE!
const pool = new Pool({
  user: 'postgres',
  password: 'root', // CHANGE THIS to your PostgreSQL password
  host: 'localhost',
  port: 5432,
  database: 'gst_job_order',
});

// Sample data arrays (expanded)
const shippers = [
  'PT. Karya Niaga Bersama', 'PT. Cakra Guna Cipta', 'PT. LISIDA AKSARA',
  'PT. Samudera Indonesia', 'PT. Djakarta Lloyd', 'PT. Meratus Line',
  'PT. Tempuran Emas', 'PT. Salam Pacific', 'PT. Tanto Intim Line',
  'PT. Bintang Laut Abadi', 'PT. Samudera Express', 'PT. Royal Shipping',
  'PT. Mega Logistics', 'PT. Prima Cargo', 'PT. Jaya Abadi',
  'PT. Indah Logistik', 'PT. Kencana Transport', 'PT. Nusantara Shipping',
  'PT. Dharma Lautan', 'PT. Bahtera Adhiguna'
];

const consignees = [
  'PT. Perfect Jakarta', 'PT. Manhattan', 'PT. Hattan',
  'PT. Royal Shipping', 'PT. Bintang Laut', 'PT. Samudera Express',
  'PT. Mega Global', 'PT. Prima Indah', 'PT. Karya Mandiri',
  'PT. Sumber Rezeki', 'PT. Tiga Bersaudara', 'PT. Anugerah Abadi'
];

const shippingLines = [
  'MAERSK Line', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd',
  'ONE', 'Evergreen', 'Yang Ming', 'ZIM', 'PIL',
  'HMM', 'Wan Hai', 'RCL', 'SITC', 'TS Lines'
];

const vesselNames = [
  'MSC Beatrice', 'MAERSK Edinburgh', 'CMA CGM Antoine', 'COSCO Shipping Gemini',
  'ONE Modern', 'Evergreen Legend', 'Hapag-Lloyd Berlin Express', 'ZIM Haifa',
  'MSC Teresa', 'MAERSK Sydney', 'CMA CGM Jacques', 'COSCO Serenity',
  'ONE Triumph', 'Evergreen Fortune', 'Hapag-Lloyd Jakarta Express', 'ZIM Chicago'
];

const ports = [
  'Surabaya', 'Jakarta', 'Semarang', 'Belawan', 'Makassar',
  'Singapore', 'Port Klang', 'Bangkok', 'Ho Chi Minh', 'Ningbo',
  'Shanghai', 'Hong Kong', 'Busan', 'Tokyo', 'Los Angeles',
  'Rotterdam', 'Hamburg', 'Antwerp', 'Felixstowe', 'Valencia'
];

const goodsList = [
  'Electronic Components', 'Textile Products', 'Furniture', 'Automotive Parts',
  'Chemical Products', 'Food Ingredients', 'Plastic Raw Materials', 'Steel Coils',
  'Paper Products', 'Rubber Materials', 'Ceramic Tiles', 'Glass Products',
  'Medical Supplies', 'Frozen Seafood', 'Coffee Beans', 'Palm Oil',
  'Rubber Gloves', 'Furniture', 'Footwear', 'Sporting Goods'
];

const containerNumbers = [
  'GESU', 'MSCU', 'MAEU', 'CMAU', 'COSU', 'ONEU', 'EGSU', 'HLBU', 'ZIMU', 'PILU',
  'SCXU', 'KKTU', 'TGHU', 'SUDU', 'AMFU', 'FSCU', 'TCNU', 'CLHU', 'MEDU', 'BEAU'
];

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const generateContainers = () => {
  const numContainers = Math.floor(Math.random() * 4) + 1; // 1 to 4 containers
  const containers = [];
  const used = new Set();
  
  for (let i = 0; i < numContainers; i++) {
    let container;
    do {
      container = randomItem(containerNumbers) + Math.floor(Math.random() * 1000000);
    } while (used.has(container));
    used.add(container);
    containers.push(container);
  }
  
  return containers;
};

// Generate EXPORT job order
const generateExportJob = (index) => {
  const etd = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
  const eta = new Date(etd);
  eta.setDate(eta.getDate() + Math.floor(Math.random() * 21) + 7);
  
  const loadingDate = new Date(etd);
  loadingDate.setDate(loadingDate.getDate() - Math.floor(Math.random() * 10) - 3);
  
  const closingDate = new Date(etd);
  closingDate.setDate(closingDate.getDate() - Math.floor(Math.random() * 7) - 2);
  
  const randomShipper = randomItem(shippers);
  const randomConsignee = randomItem(consignees);
  const randomPOL = randomItem(ports);
  let randomPOD = randomItem(ports);
  while (randomPOD === randomPOL) randomPOD = randomItem(ports);
  
  return {
    jo_number: `EXP${String(2026000 + index).slice(-6)}`,
    jo_type: 'EXPORT',
    shipper_name: randomShipper,
    consignee_name: randomConsignee,
    volume: `${Math.floor(Math.random() * 8) + 1}x${Math.random() > 0.5 ? '40' : '20'}`,
    shipping_line: randomItem(shippingLines),
    vessel_name: randomItem(vesselNames),
    port_of_loading: randomPOL,
    port_of_discharge: randomPOD,
    person_in_charge: `Person ${Math.floor(Math.random() * 50) + 1}`,
    aju_number: `AJU${Math.floor(Math.random() * 10000000)}`,
    eta: formatDate(eta),
    etd: formatDate(etd),
    goods: randomItem(goodsList),
    loading_date: formatDate(loadingDate),
    closing_date: formatDate(closingDate),
    sppb_date: null,
    dooring_date: null,
    extra_note: randomItem(['Handle with care', 'Temperature sensitive', 'Fragile items', 'Keep dry', 'Priority shipment']),
    containers: generateContainers()
  };
};

// Generate IMPORT job order
const generateImportJob = (index) => {
  const etd = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
  const eta = new Date(etd);
  eta.setDate(eta.getDate() + Math.floor(Math.random() * 28) + 14);
  
  const sppbDate = new Date(eta);
  sppbDate.setDate(sppbDate.getDate() + Math.floor(Math.random() * 7) + 2);
  
  const dooringDate = new Date(sppbDate);
  dooringDate.setDate(dooringDate.getDate() + Math.floor(Math.random() * 5) + 1);
  
  const randomShipper = randomItem(shippers);
  const randomConsignee = randomItem(consignees);
  let randomPOL = randomItem(ports);
  while (randomPOL === 'Surabaya') randomPOL = randomItem(ports);
  
  return {
    jo_number: `IMP${String(2026000 + index).slice(-6)}`,
    jo_type: 'IMPORT',
    shipper_name: randomShipper,
    consignee_name: randomConsignee,
    volume: `${Math.floor(Math.random() * 8) + 1}x${Math.random() > 0.5 ? '40' : '20'}`,
    shipping_line: randomItem(shippingLines),
    vessel_name: randomItem(vesselNames),
    port_of_loading: randomPOL,
    port_of_discharge: 'Surabaya',
    person_in_charge: `Person ${Math.floor(Math.random() * 50) + 1}`,
    aju_number: `AJU${Math.floor(Math.random() * 10000000)}`,
    eta: formatDate(eta),
    etd: formatDate(etd),
    goods: randomItem(goodsList),
    loading_date: null,
    closing_date: null,
    sppb_date: formatDate(sppbDate),
    dooring_date: formatDate(dooringDate),
    extra_note: randomItem(['Customs clearance needed', 'Warehouse inspection', 'Direct delivery', 'Storage required']),
    containers: generateContainers()
  };
};

// Generate DOMESTIC job order
const generateDomesticJob = (index) => {
  const etd = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
  const eta = new Date(etd);
  eta.setDate(eta.getDate() + Math.floor(Math.random() * 10) + 3);
  
  const loadingDate = new Date(etd);
  loadingDate.setDate(loadingDate.getDate() - Math.floor(Math.random() * 7) - 2);
  
  const closingDate = new Date(etd);
  closingDate.setDate(closingDate.getDate() - Math.floor(Math.random() * 5) - 1);
  
  const indonesianPorts = ['Surabaya', 'Jakarta', 'Semarang', 'Belawan', 'Makassar', 'Balikpapan', 'Pontianak', 'Banjarmasin'];
  const pol = randomItem(indonesianPorts);
  let pod = randomItem(indonesianPorts);
  while (pod === pol) pod = randomItem(indonesianPorts);
  
  return {
    jo_number: `DOM${String(2026000 + index).slice(-6)}`,
    jo_type: 'DOMESTIC',
    shipper_name: randomItem(shippers),
    consignee_name: randomItem(consignees),
    volume: `${Math.floor(Math.random() * 6) + 1}x${Math.random() > 0.5 ? '40' : '20'}`,
    shipping_line: randomItem(shippingLines.slice(0, 8)),
    vessel_name: randomItem(vesselNames),
    port_of_loading: pol,
    port_of_discharge: pod,
    person_in_charge: `Person ${Math.floor(Math.random() * 50) + 1}`,
    aju_number: `AJU${Math.floor(Math.random() * 10000000)}`,
    eta: formatDate(eta),
    etd: formatDate(etd),
    goods: randomItem(goodsList),
    loading_date: formatDate(loadingDate),
    closing_date: formatDate(closingDate),
    sppb_date: null,
    dooring_date: null,
    extra_note: randomItem(['Local delivery', 'Inter-island shipping', 'Priority handling']),
    containers: generateContainers()
  };
};

// Main seeding function
async function runBigSeed() {
  console.log('========================================');
  console.log('🌱 MASSIVE Database Seeding Started!');
  console.log('========================================\n');
  
  try {
    console.log('🗑️  Clearing existing data...');
    await pool.query('DELETE FROM containers');
    await pool.query('DELETE FROM job_orders');
    console.log('✅ Existing data cleared\n');
    
    console.log('📦 Generating massive seed data...');
    
    const exportJobs = [];
    const importJobs = [];
    const domesticJobs = [];
    
    // Generate 40 export jobs
    for (let i = 1; i <= 40; i++) {
      exportJobs.push(generateExportJob(i));
    }
    
    // Generate 40 import jobs
    for (let i = 1; i <= 40; i++) {
      importJobs.push(generateImportJob(40 + i));
    }
    
    // Generate 30 domestic jobs
    for (let i = 1; i <= 30; i++) {
      domesticJobs.push(generateDomesticJob(80 + i));
    }
    
    const allJobs = [...exportJobs, ...importJobs, ...domesticJobs];
    
    console.log(`✅ Generated ${allJobs.length} job orders:`);
    console.log(`   - EXPORT: ${exportJobs.length}`);
    console.log(`   - IMPORT: ${importJobs.length}`);
    console.log(`   - DOMESTIC: ${domesticJobs.length}\n`);
    
    console.log('💾 Inserting data into database...');
    
    let insertedCount = 0;
    let containerCount = 0;
    
    for (const job of allJobs) {
      const result = await pool.query(
        `
        INSERT INTO job_orders (
          jo_number, jo_type, shipper_name, consignee_name, volume,
          shipping_line, vessel_name, port_of_loading, port_of_discharge,
          person_in_charge, aju_number, eta, etd, goods,
          loading_date, closing_date, sppb_date, dooring_date, extra_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING job_order_id
        `,
        [
          job.jo_number, job.jo_type, job.shipper_name, job.consignee_name, job.volume,
          job.shipping_line, job.vessel_name, job.port_of_loading, job.port_of_discharge,
          job.person_in_charge, job.aju_number, job.eta, job.etd, job.goods,
          job.loading_date, job.closing_date, job.sppb_date, job.dooring_date, job.extra_note
        ]
      );
      
      const jobOrderId = result.rows[0].job_order_id;
      
      for (const containerNumber of job.containers) {
        await pool.query(
          `INSERT INTO containers (job_order_id, container_number) VALUES ($1, $2)`,
          [jobOrderId, containerNumber]
        );
        containerCount++;
      }
      
      insertedCount++;
      
      // Show progress every 20 records
      if (insertedCount % 20 === 0) {
        console.log(`   Progress: ${insertedCount}/${allJobs.length} inserted (${Math.round(insertedCount/allJobs.length*100)}%)`);
      }
    }
    
    console.log(`\n   Progress: ${insertedCount}/${allJobs.length} inserted (100%)`);
    console.log(`   📦 Total containers inserted: ${containerCount}\n`);
    
    console.log('========================================');
    console.log('✅ Massive Seeding Completed Successfully!');
    console.log('========================================');
    console.log(`📊 Summary:`);
    console.log(`   - Total Job Orders: ${insertedCount}`);
    console.log(`   - EXPORT: ${exportJobs.length}`);
    console.log(`   - IMPORT: ${importJobs.length}`);
    console.log(`   - DOMESTIC: ${domesticJobs.length}`);
    console.log(`   - Containers: ${containerCount}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await pool.end();
  }
}

runBigSeed();