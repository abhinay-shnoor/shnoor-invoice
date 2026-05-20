import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import pg from 'pg'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

// In-memory/JSON fallback DB utility
const FALLBACK_DB_PATH = path.resolve('db.json')
const defaultSuperAdmin = {
  id: 1,
  email: 'admin@shnoorinvoice.com',
  name: 'Super Admin',
  role: 'admin',
  created_at: new Date().toISOString()
}

function readFallbackDB() {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify({ users: [defaultSuperAdmin] }, null, 2))
  }
  try {
    const content = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading local db.json, resetting to default:', error)
    return { users: [defaultSuperAdmin] }
  }
}

function writeFallbackDB(data) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2))
}

// Database Connection String
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
let pool = null
let useLocalFallback = true

if (connectionString) {
  console.log('⚡ Attempting to connect to Neon PostgreSQL database...')
  pool = new pg.Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Neon serverless postgres connections
    }
  })

  // Test Neon Connection and Run Migrations
  try {
    const client = await pool.connect()
    console.log('🟢 Neon PostgreSQL connected successfully!')
    useLocalFallback = false

    // Run Migration: Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Seed default super admin
    await client.query(`
      INSERT INTO users (email, name, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `, [defaultSuperAdmin.email, defaultSuperAdmin.name, defaultSuperAdmin.role])

    client.release()
    console.log('📊 Neon database migrations and seeding complete.')
  } catch (err) {
    console.error('🔴 Neon Connection failed. Falling back to local db.json file database.', err.message)
    useLocalFallback = true
  }
} else {
  console.log('ℹ️ No Neon DATABASE_URL found in .env. Running on local db.json file database.')
}

// --- API ENDPOINTS ---

// 1. Authenticate / Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, name } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const cleanEmail = email.toLowerCase().trim()
  const cleanName = name || cleanEmail.split('@')[0]

  try {
    if (!useLocalFallback) {
      // Postgres Query
      const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail])
      if (userRes.rows.length > 0) {
        return res.json({ user: userRes.rows[0], source: 'neon' })
      } else {
        // Automatically register new user
        // Determine role (default superadmin gets admin role automatically)
        const role = cleanEmail === defaultSuperAdmin.email ? 'admin' : 'user'
        const insertRes = await pool.query(
          'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
          [cleanEmail, cleanName, role]
        )
        return res.status(201).json({ user: insertRes.rows[0], source: 'neon' })
      }
    } else {
      // Local fallback DB
      const db = readFallbackDB()
      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail)
      if (user) {
        return res.json({ user, source: 'local' })
      } else {
        const role = cleanEmail === defaultSuperAdmin.email ? 'admin' : 'user'
        const newUser = {
          id: db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
          email: cleanEmail,
          name: cleanName,
          role,
          created_at: new Date().toISOString()
        }
        db.users.push(newUser)
        writeFallbackDB(db)
        return res.status(201).json({ user: newUser, source: 'local' })
      }
    }
  } catch (error) {
    console.error('Authentication API error:', error)
    res.status(500).json({ error: 'Database authentication error', details: error.message })
  }
})

// 2. Fetch all users (Superadmin Dashboard Feature)
app.get('/api/users', async (req, res) => {
  try {
    if (!useLocalFallback) {
      const userRes = await pool.query('SELECT * FROM users ORDER BY id ASC')
      return res.json({ users: userRes.rows, source: 'neon' })
    } else {
      const db = readFallbackDB()
      return res.json({ users: db.users, source: 'local' })
    }
  } catch (error) {
    console.error('Get Users API error:', error)
    res.status(500).json({ error: 'Database fetch error', details: error.message })
  }
})

// 3. Add new user manually (Superadmin User Management Panel)
app.post('/api/users', async (req, res) => {
  const { email, name, role } = req.body
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and Name are required' })
  }

  const cleanEmail = email.toLowerCase().trim()
  const cleanRole = role === 'admin' ? 'admin' : 'user'

  try {
    if (!useLocalFallback) {
      // Check if user already exists
      const checkRes = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail])
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }

      const insertRes = await pool.query(
        'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
        [cleanEmail, name, cleanRole]
      )
      return res.status(201).json({ user: insertRes.rows[0], source: 'neon' })
    } else {
      const db = readFallbackDB()
      const check = db.users.find(u => u.email.toLowerCase() === cleanEmail)
      if (check) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }

      const newUser = {
        id: db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
        email: cleanEmail,
        name,
        role: cleanRole,
        created_at: new Date().toISOString()
      }
      db.users.push(newUser)
      writeFallbackDB(db)
      return res.status(201).json({ user: newUser, source: 'local' })
    }
  } catch (error) {
    console.error('Create User API error:', error)
    res.status(500).json({ error: 'Database insert error', details: error.message })
  }
})

// 4. Delete user (Superadmin Panel Feature)
app.delete('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id)
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid User ID' })
  }

  try {
    if (!useLocalFallback) {
      // Prevent deleting the main super admin
      const checkRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId])
      if (checkRes.rows.length > 0 && checkRes.rows[0].email === defaultSuperAdmin.email) {
        return res.status(400).json({ error: 'Cannot delete the primary Super Admin' })
      }

      await pool.query('DELETE FROM users WHERE id = $1', [userId])
      return res.json({ message: 'User deleted successfully', id: userId, source: 'neon' })
    } else {
      const db = readFallbackDB()
      const user = db.users.find(u => u.id === userId)
      if (user && user.email === defaultSuperAdmin.email) {
        return res.status(400).json({ error: 'Cannot delete the primary Super Admin' })
      }

      db.users = db.users.filter(u => u.id !== userId)
      writeFallbackDB(db)
      return res.json({ message: 'User deleted successfully', id: userId, source: 'local' })
    }
  } catch (error) {
    console.error('Delete User API error:', error)
    res.status(500).json({ error: 'Database delete error', details: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 SmartInvoice full-stack API server running at http://localhost:${PORT}`)
  console.log(`📂 Environment fallback DB is at: ${FALLBACK_DB_PATH}`)
})
