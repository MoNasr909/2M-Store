const express = require('express');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-change-me';

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || 'admin@2mstore.com';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'ChangeMe123!';

const localDataDir = path.join(__dirname, 'data');

if (!fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

/*
=====================================================
DATABASE
=====================================================

Local:
    file:./data/2mstore.db

Production:
    TURSO_DATABASE_URL
    TURSO_AUTH_TOKEN
*/

const localDatabaseUrl =
  `file:${path.join(localDataDir, '2mstore.db')}`;

const db = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    localDatabaseUrl,

  authToken:
    process.env.TURSO_AUTH_TOKEN || undefined
});


/* =====================================================
   DATABASE HELPERS
===================================================== */

async function execute(sql, args = []) {
  return db.execute({
    sql,
    args
  });
}


async function get(sql, args = []) {

  const result =
    await execute(sql, args);

  return result.rows[0] || undefined;
}


async function all(sql, args = []) {

  const result =
    await execute(sql, args);

  return result.rows;
}


async function run(sql, args = []) {

  const result =
    await execute(sql, args);

  return {
    lastInsertRowid:
      result.lastInsertRowid !== undefined
        ? Number(result.lastInsertRowid)
        : undefined,

    changes:
      Number(result.rowsAffected || 0)
  };
}


/* =====================================================
   DATABASE INITIALIZATION
===================================================== */

async function initializeDatabase() {

  await execute(
    'PRAGMA foreign_keys = ON'
  );

  await db.batch(
    [

      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        governorate TEXT NOT NULL,
        area TEXT NOT NULL,
        address TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('watch','perfume')),
        description TEXT DEFAULT '',
        price REAL NOT NULL,
        old_price REAL,
        image TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,

        size TEXT DEFAULT '',
        gender TEXT DEFAULT '',
        notes TEXT DEFAULT '',

        volume TEXT DEFAULT '',
        fragrance_family TEXT DEFAULT '',
        top_notes TEXT DEFAULT '',
        middle_notes TEXT DEFAULT '',
        base_notes TEXT DEFAULT '',

        case_material TEXT DEFAULT '',
        strap_material TEXT DEFAULT '',
        color TEXT DEFAULT '',
        movement TEXT DEFAULT '',
        water_resistance TEXT DEFAULT '',
        watch_size TEXT DEFAULT '',

        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'New',
        payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,

        FOREIGN KEY(order_id)
          REFERENCES orders(id),

        FOREIGN KEY(product_id)
          REFERENCES products(id)
      )
      `

    ],
    'write'
  );


  /* =====================================================
     DATABASE MIGRATION
  ===================================================== */

  const columns =
    await all(
      'PRAGMA table_info(products)'
    );

  const existingColumns =
    new Set(
      columns.map(
        column => column.name
      )
    );


  const newColumns = [

    ['volume', "TEXT DEFAULT ''"],

    [
      'fragrance_family',
      "TEXT DEFAULT ''"
    ],

    [
      'top_notes',
      "TEXT DEFAULT ''"
    ],

    [
      'middle_notes',
      "TEXT DEFAULT ''"
    ],

    [
      'base_notes',
      "TEXT DEFAULT ''"
    ],

    [
      'case_material',
      "TEXT DEFAULT ''"
    ],

    [
      'strap_material',
      "TEXT DEFAULT ''"
    ],

    [
      'color',
      "TEXT DEFAULT ''"
    ],

    [
      'movement',
      "TEXT DEFAULT ''"
    ],

    [
      'water_resistance',
      "TEXT DEFAULT ''"
    ],

    [
      'watch_size',
      "TEXT DEFAULT ''"
    ]

  ];


  for (
    const [name, definition]
    of newColumns
  ) {

    if (!existingColumns.has(name)) {

      await execute(
        `ALTER TABLE products ADD COLUMN ${name} ${definition}`
      );

    }

  }


  await seedDatabase();

}


/* =====================================================
   SEED DATABASE
===================================================== */

async function seedDatabase() {

  const countRow =
    await get(
      'SELECT COUNT(*) AS c FROM products'
    );

  const count =
    Number(countRow?.c || 0);


  if (!count) {

    const products = [

      [
        'Lacoste White',
        'perfume',
        'Clean, fresh and elegant signature scent.',
        350,
        null,
        '/assets/perfume-black.svg',
        20,
        '50ml',
        'Unisex',
        'Fresh / Clean',
        '50ml',
        'Fresh / Clean',
        'Citrus',
        'Floral',
        'Musk',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        'Rojat Rouge',
        'perfume',
        'Warm and confident fragrance for everyday style.',
        350,
        null,
        '/assets/perfume-red.svg',
        20,
        '50ml',
        'Unisex',
        'Woody / Amber',
        '50ml',
        'Woody / Amber',
        'Fruity',
        'Floral',
        'Amber / Woody',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        'Silver Scent',
        'perfume',
        'A bold silver-style fragrance with a modern profile.',
        350,
        null,
        '/assets/perfume-black.svg',
        20,
        '50ml',
        'Men',
        'Woody / Fresh',
        '50ml',
        'Woody / Fresh',
        'Citrus',
        'Spicy',
        'Woody',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        'Invictus',
        'perfume',
        'Fresh aquatic character with a confident finish.',
        350,
        null,
        '/assets/perfume-blue.svg',
        20,
        '50ml',
        'Men',
        'Aquatic / Woody',
        '50ml',
        'Aquatic / Woody',
        'Grapefruit',
        'Bay Leaf',
        'Ambergris / Guaiac Wood',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        'Paradise Garden',
        'perfume',
        'Green floral inspired scent with a smooth finish.',
        350,
        null,
        '/assets/perfume-green.svg',
        20,
        '50ml',
        'Women',
        'Green / Floral',
        '50ml',
        'Green / Floral',
        'Green Notes',
        'Floral',
        'Woody',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        'Dice',
        'perfume',
        'Playful modern fragrance with a clean presentation.',
        350,
        null,
        '/assets/perfume-black.svg',
        20,
        '50ml',
        'Unisex',
        'Fresh / Musky',
        '50ml',
        'Fresh / Musky',
        'Fresh',
        'Floral',
        'Musk',
        '',
        '',
        '',
        '',
        '',
        ''
      ],

      [
        '2M Classic Green',
        'watch',
        'Classic metal watch with a green dial.',
        2500,
        null,
        '/assets/watch-green.svg',
        8,
        '',
        'Unisex',
        '',
        '',
        '',
        '',
        '',
        '',
        'Stainless Steel',
        'Stainless Steel',
        'Green',
        'Quartz',
        '3 ATM',
        '40mm'
      ],

      [
        '2M Silver Classic',
        'watch',
        'Minimal silver-tone watch for daily wear.',
        2500,
        null,
        '/assets/watch-silver.svg',
        8,
        '',
        'Unisex',
        '',
        '',
        '',
        '',
        '',
        '',
        'Stainless Steel',
        'Stainless Steel',
        'Silver',
        'Quartz',
        '3 ATM',
        '40mm'
      ]

    ];


    const statements =
      products.map(row => ({

        sql: `
          INSERT INTO products(
            name,
            category,
            description,
            price,
            old_price,
            image,
            stock,
            size,
            gender,
            notes,

            volume,
            fragrance_family,
            top_notes,
            middle_notes,
            base_notes,

            case_material,
            strap_material,
            color,
            movement,
            water_resistance,
            watch_size
          )
          VALUES(
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?
          )
        `,

        args: row

      }));


    await db.batch(
      statements,
      'write'
    );

  }


  const adminUser =
    await get(
      'SELECT id FROM users WHERE email=?',
      [ADMIN_EMAIL]
    );


  if (!adminUser) {

    const hash =
      bcrypt.hashSync(
        ADMIN_PASSWORD,
        12
      );


    await run(
      `
      INSERT INTO users(
        name,
        email,
        phone,
        governorate,
        area,
        address,
        password_hash,
        role
      )
      VALUES(?,?,?,?,?,?,?,?)
      `,
      [
        '2M Store Admin',
        ADMIN_EMAIL,
        '01280765582',
        'Cairo',
        'Admin',
        '2M Store',
        hash,
        'admin'
      ]
    );

  }

}


/* =====================================================
   APP
===================================================== */

const app = express();

app.set('trust proxy', 1);

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(cookieParser());

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);


/* =====================================================
   AUTH
===================================================== */

function sign(user) {

  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );

}


function auth(req, res, next) {

  const token =
    req.cookies.token;


  if (!token) {

    return res
      .status(401)
      .json({
        error:
          'Authentication required'
      });

  }


  try {

    req.user =
      jwt.verify(
        token,
        JWT_SECRET
      );

    next();

  } catch {

    return res
      .status(401)
      .json({
        error:
          'Session expired'
      });

  }

}


function admin(req, res, next) {

  if (
    req.user.role !== 'admin'
  ) {

    return res
      .status(403)
      .json({
        error:
          'Admin only'
      });

  }

  next();

}


async function publicUser(id) {

  return get(
    `
    SELECT
      id,
      name,
      email,
      phone,
      governorate,
      area,
      address,
      role,
      created_at
    FROM users
    WHERE id=?
    `,
    [id]
  );

}


/* =====================================================
   PRODUCTS
===================================================== */

app.get(
  '/api/products',
  async (req, res) => {

    try {

      const {
        category,
        search
      } = req.query;


      let sql =
        'SELECT * FROM products WHERE active=1';


      const args = [];


      if (category) {

        sql +=
          ' AND category=?';

        args.push(category);

      }


      if (search) {

        sql += `
          AND (
            name LIKE ?
            OR description LIKE ?
          )
        `;

        args.push(
          `%${search}%`,
          `%${search}%`
        );

      }


      sql +=
        ' ORDER BY id DESC';


      res.json(
        await all(sql, args)
      );

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load products'
        });

    }

  }
);


app.get(
  '/api/products/:id',
  async (req, res) => {

    try {

      const p =
        await get(
          `
          SELECT *
          FROM products
          WHERE id=?
          AND active=1
          `,
          [req.params.id]
        );


      if (!p) {

        return res
          .status(404)
          .json({
            error:
              'Product not found'
          });

      }


      res.json(p);

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load product'
        });

    }

  }
);


/* =====================================================
   AUTH - REGISTER
===================================================== */

app.post(
  '/api/auth/register',
  async (req, res) => {

    try {

      const {
        name,
        email,
        phone,
        governorate,
        area,
        address,
        password
      } = req.body;


      if (
        !name ||
        !email ||
        !phone ||
        !governorate ||
        !area ||
        !address ||
        !password ||
        password.length < 6
      ) {

        return res
          .status(400)
          .json({
            error:
              'Please complete all fields. Password must be at least 6 characters.'
          });

      }


      const normalizedEmail =
        email.trim().toLowerCase();


      const existing =
        await get(
          'SELECT id FROM users WHERE email=?',
          [normalizedEmail]
        );


      if (existing) {

        return res
          .status(409)
          .json({
            error:
              'Email already registered'
          });

      }


      const hash =
        bcrypt.hashSync(
          password,
          12
        );


      const info =
        await run(
          `
          INSERT INTO users(
            name,
            email,
            phone,
            governorate,
            area,
            address,
            password_hash
          )
          VALUES(?,?,?,?,?,?,?)
          `,
          [
            name,
            normalizedEmail,
            phone,
            governorate,
            area,
            address,
            hash
          ]
        );


      const user =
        await publicUser(
          info.lastInsertRowid
        );


      res.cookie(
        'token',
        sign(user),
        {
          httpOnly: true,
          sameSite: 'lax',
          secure:
            process.env.NODE_ENV ===
            'production',
          maxAge:
            7 * 24 * 3600 * 1000
        }
      );


      res
        .status(201)
        .json({
          user
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Registration failed'
        });

    }

  }
);


/* =====================================================
   AUTH - LOGIN
===================================================== */

app.post(
  '/api/auth/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      const row =
        await get(
          'SELECT * FROM users WHERE email=?',
          [
            (email || '')
              .trim()
              .toLowerCase()
          ]
        );


      if (
        !row ||
        !bcrypt.compareSync(
          password || '',
          row.password_hash
        )
      ) {

        return res
          .status(401)
          .json({
            error:
              'Invalid email or password'
          });

      }


      res.cookie(
        'token',
        sign(row),
        {
          httpOnly: true,
          sameSite: 'lax',
          secure:
            process.env.NODE_ENV ===
            'production',
          maxAge:
            7 * 24 * 3600 * 1000
        }
      );


      res.json({
        user:
          await publicUser(row.id)
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Login failed'
        });

    }

  }
);


/* =====================================================
   AUTH - LOGOUT
===================================================== */

app.post(
  '/api/auth/logout',
  (req, res) => {

    res.clearCookie(
      'token'
    );

    res.json({
      ok: true
    });

  }
);


/* =====================================================
   AUTH - ME
===================================================== */

app.get(
  '/api/auth/me',
  auth,
  async (req, res) => {

    try {

      res.json({
        user:
          await publicUser(
            req.user.id
          )
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load user'
        });

    }

  }
);


/* =====================================================
   AUTH - UPDATE PROFILE
===================================================== */

app.put(
  '/api/auth/me',
  auth,
  async (req, res) => {

    try {

      const {
        name,
        phone,
        governorate,
        area,
        address
      } = req.body;


      if (
        !name ||
        !phone ||
        !governorate ||
        !area ||
        !address
      ) {

        return res
          .status(400)
          .json({
            error:
              'Please complete all fields'
          });

      }


      await run(
        `
        UPDATE users
        SET
          name=?,
          phone=?,
          governorate=?,
          area=?,
          address=?
        WHERE id=?
        `,
        [
          name,
          phone,
          governorate,
          area,
          address,
          req.user.id
        ]
      );


      res.json({
        user:
          await publicUser(
            req.user.id
          )
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to update profile'
        });

    }

  }
);


/* =====================================================
   ORDERS
===================================================== */

app.post(
  '/api/orders',
  auth,
  async (req, res) => {

    let tx = null;

    try {

      const {
        items,
        paymentMethod =
          'Cash on Delivery',
        notes = '',
        deliveryFee = 0
      } = req.body;


      if (
        !Array.isArray(items) ||
        !items.length
      ) {

        return res
          .status(400)
          .json({
            error:
              'Cart is empty'
          });

      }


      const allowedPaymentMethods = [
        'Cash on Delivery'
      ];


      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid payment method'
          });

      }


      const parsedDeliveryFee =
        Number(deliveryFee);


      if (
        !Number.isFinite(
          parsedDeliveryFee
        ) ||
        parsedDeliveryFee < 0
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid delivery fee'
          });

      }


      tx =
        await db.transaction('write');


      let subtotal = 0;

      const normalized = [];


      /*
      ---------------------------------------------
      Validate stock INSIDE transaction
      ---------------------------------------------
      */

      for (const item of items) {

        const productId =
          Number(
            item.productId
          );


        const qty =
          Math.max(
            1,
            Math.floor(
              Number(
                item.quantity
              ) || 1
            )
          );


        if (
          !Number.isInteger(
            productId
          )
        ) {

          throw new Error(
            'Invalid product'
          );

        }


        const result =
          await tx.execute({
            sql: `
              SELECT *
              FROM products
              WHERE id=?
              AND active=1
            `,
            args: [
              productId
            ]
          });


        const p =
          result.rows[0];


        if (!p) {

          throw new Error(
            'A product is no longer available'
          );

        }


        if (
          Number(p.stock) <
          qty
        ) {

          throw new Error(
            `Not enough stock for ${p.name}`
          );

        }


        subtotal +=
          Number(p.price) *
          qty;


        normalized.push({
          p,
          qty
        });

      }


      const total =
        subtotal +
        parsedDeliveryFee;


      const orderResult =
        await tx.execute({
          sql: `
            INSERT INTO orders(
              user_id,
              total,
              delivery_fee,
              status,
              payment_method,
              notes
            )
            VALUES(?,?,?,?,?,?)
          `,
          args: [
            req.user.id,
            total,
            parsedDeliveryFee,
            'New',
            paymentMethod,
            notes
          ]
        });


      const orderId =
        Number(
          orderResult.lastInsertRowid
        );


      for (
        const item
        of normalized
      ) {

        await tx.execute({
          sql: `
            INSERT INTO order_items(
              order_id,
              product_id,
              product_name,
              price,
              quantity
            )
            VALUES(?,?,?,?,?)
          `,
          args: [
            orderId,
            item.p.id,
            item.p.name,
            item.p.price,
            item.qty
          ]
        });


        await tx.execute({
          sql: `
            UPDATE products
            SET stock=stock-?
            WHERE id=?
          `,
          args: [
            item.qty,
            item.p.id
          ]
        });

      }


      await tx.commit();

      tx = null;


      res
        .status(201)
        .json({
          orderId,

          number:
            `2M${String(orderId).padStart(4, '0')}`,

          total
        });

    } catch (error) {

      if (tx) {

        try {
          await tx.rollback();
        } catch {}

      }


      console.error(error);


      const message =
        error.message ||
        'Failed to create order';


      res
        .status(400)
        .json({
          error: message
        });

    }

  }
);


/* =====================================================
   ORDER DETAILS
===================================================== */

async function orderDetails(order) {

  const items =
    await all(
      `
      SELECT *
      FROM order_items
      WHERE order_id=?
      `,
      [order.id]
    );


  const user =
    await publicUser(
      order.user_id
    );


  return {
    ...order,
    user,
    items
  };

}


/* =====================================================
   CUSTOMER ORDERS
===================================================== */

app.get(
  '/api/orders/my',
  auth,
  async (req, res) => {

    try {

      const orders =
        await all(
          `
          SELECT *
          FROM orders
          WHERE user_id=?
          ORDER BY id DESC
          `,
          [req.user.id]
        );


      const result =
        await Promise.all(
          orders.map(
            orderDetails
          )
        );


      res.json(result);

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load orders'
        });

    }

  }
);


/* =====================================================
   ADMIN PRODUCTS - GET
===================================================== */

app.get(
  '/api/admin/products',
  auth,
  admin,
  async (req, res) => {

    try {

      res.json(
        await all(
          `
          SELECT *
          FROM products
          ORDER BY id DESC
          `
        )
      );

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load products'
        });

    }

  }
);


/* =====================================================
   ADMIN PRODUCTS - CREATE
===================================================== */

app.post(
  '/api/admin/products',
  auth,
  admin,
  async (req, res) => {

    try {

      const {
        name,
        category,
        description = '',
        price,
        oldPrice = null,
        image,
        stock = 0,
        gender = '',

        volume = '',
        fragranceFamily = '',
        topNotes = '',
        middleNotes = '',
        baseNotes = '',

        caseMaterial = '',
        strapMaterial = '',
        color = '',
        movement = '',
        waterResistance = '',
        watchSize = ''

      } = req.body;


      if (
        !name ||
        !category ||
        price === undefined ||
        price === null ||
        !image
      ) {

        return res
          .status(400)
          .json({
            error:
              'Name, category, price and image are required'
          });

      }


      if (
        !['watch', 'perfume']
          .includes(category)
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid category'
          });

      }


      const numericPrice =
        Number(price);

      const numericStock =
        Number(stock);


      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid price'
          });

      }


      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid stock'
          });

      }


      const result =
        await run(
          `
          INSERT INTO products(
            name,
            category,
            description,
            price,
            old_price,
            image,
            stock,
            gender,

            volume,
            fragrance_family,
            top_notes,
            middle_notes,
            base_notes,

            case_material,
            strap_material,
            color,
            movement,
            water_resistance,
            watch_size
          )
          VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,

            ?,
            ?,
            ?,
            ?,
            ?,

            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `,
          [

            name,
            category,
            description,
            numericPrice,

            oldPrice === null ||
            oldPrice === ''
              ? null
              : Number(oldPrice),

            image,
            numericStock,
            gender,

            category === 'perfume'
              ? volume
              : '',

            category === 'perfume'
              ? fragranceFamily
              : '',

            category === 'perfume'
              ? topNotes
              : '',

            category === 'perfume'
              ? middleNotes
              : '',

            category === 'perfume'
              ? baseNotes
              : '',

            category === 'watch'
              ? caseMaterial
              : '',

            category === 'watch'
              ? strapMaterial
              : '',

            category === 'watch'
              ? color
              : '',

            category === 'watch'
              ? movement
              : '',

            category === 'watch'
              ? waterResistance
              : '',

            category === 'watch'
              ? watchSize
              : ''

          ]
        );


      res
        .status(201)
        .json(
          await get(
            'SELECT * FROM products WHERE id=?',
            [result.lastInsertRowid]
          )
        );

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to create product'
        });

    }

  }
);


/* =====================================================
   ADMIN PRODUCTS - UPDATE
===================================================== */

app.put(
  '/api/admin/products/:id',
  auth,
  admin,
  async (req, res) => {

    try {

      const {
        name,
        category,
        description = '',
        price,
        oldPrice = null,
        image,
        stock = 0,
        gender = '',

        volume = '',
        fragranceFamily = '',
        topNotes = '',
        middleNotes = '',
        baseNotes = '',

        caseMaterial = '',
        strapMaterial = '',
        color = '',
        movement = '',
        waterResistance = '',
        watchSize = '',

        active = 1

      } = req.body;


      if (
        !name ||
        !category ||
        price === undefined ||
        !image
      ) {

        return res
          .status(400)
          .json({
            error:
              'Name, category, price and image are required'
          });

      }


      if (
        !['watch', 'perfume']
          .includes(category)
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid category'
          });

      }


      const numericPrice =
        Number(price);

      const numericStock =
        Number(stock);


      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid price'
          });

      }


      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid stock'
          });

      }


      await run(
        `
        UPDATE products
        SET
          name=?,
          category=?,
          description=?,
          price=?,
          old_price=?,
          image=?,
          stock=?,
          gender=?,

          volume=?,
          fragrance_family=?,
          top_notes=?,
          middle_notes=?,
          base_notes=?,

          case_material=?,
          strap_material=?,
          color=?,
          movement=?,
          water_resistance=?,
          watch_size=?,

          active=?

        WHERE id=?
        `,
        [

          name,
          category,
          description,
          numericPrice,

          oldPrice === null ||
          oldPrice === ''
            ? null
            : Number(oldPrice),

          image,
          numericStock,
          gender,

          category === 'perfume'
            ? volume
            : '',

          category === 'perfume'
            ? fragranceFamily
            : '',

          category === 'perfume'
            ? topNotes
            : '',

          category === 'perfume'
            ? middleNotes
            : '',

          category === 'perfume'
            ? baseNotes
            : '',

          category === 'watch'
            ? caseMaterial
            : '',

          category === 'watch'
            ? strapMaterial
            : '',

          category === 'watch'
            ? color
            : '',

          category === 'watch'
            ? movement
            : '',

          category === 'watch'
            ? waterResistance
            : '',

          category === 'watch'
            ? watchSize
            : '',

          active ? 1 : 0,

          req.params.id

        ]
      );


      const product =
        await get(
          'SELECT * FROM products WHERE id=?',
          [req.params.id]
        );


      if (!product) {

        return res
          .status(404)
          .json({
            error:
              'Product not found'
          });

      }


      res.json(product);

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to update product'
        });

    }

  }
);


/* =====================================================
   ADMIN PRODUCTS - DELETE
===================================================== */

app.delete(
  '/api/admin/products/:id',
  auth,
  admin,
  async (req, res) => {

    try {

      await run(
        `
        UPDATE products
        SET active=0
        WHERE id=?
        `,
        [req.params.id]
      );


      res.json({
        ok: true
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to delete product'
        });

    }

  }
);


/* =====================================================
   ADMIN ORDERS - GET
===================================================== */

app.get(
  '/api/admin/orders',
  auth,
  admin,
  async (req, res) => {

    try {

      const orders =
        await all(
          `
          SELECT *
          FROM orders
          ORDER BY id DESC
          `
        );


      const result =
        await Promise.all(
          orders.map(
            orderDetails
          )
        );


      res.json(result);

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load orders'
        });

    }

  }
);


/* =====================================================
   ADMIN ORDERS - UPDATE STATUS
===================================================== */

app.put(
  '/api/admin/orders/:id',
  auth,
  admin,
  async (req, res) => {

    try {

      const allowed = [

        'New',

        'Confirmed',

        'Preparing',

        'Shipped',

        'Delivered',

        'Cancelled'

      ];


      if (
        !allowed.includes(
          req.body.status
        )
      ) {

        return res
          .status(400)
          .json({
            error:
              'Invalid status'
          });

      }


      const order =
        await get(
          'SELECT * FROM orders WHERE id=?',
          [req.params.id]
        );


      if (!order) {

        return res
          .status(404)
          .json({
            error:
              'Order not found'
          });

      }


      await run(
        `
        UPDATE orders
        SET status=?
        WHERE id=?
        `,
        [
          req.body.status,
          req.params.id
        ]
      );


      res.json(
        await orderDetails(
          await get(
            'SELECT * FROM orders WHERE id=?',
            [req.params.id]
          )
        )
      );

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to update order'
        });

    }

  }
);


/* =====================================================
   ADMIN STATS
===================================================== */

app.get(
  '/api/admin/stats',
  auth,
  admin,
  async (req, res) => {

    try {

      const ordersRow =
        await get(
          'SELECT COUNT(*) AS c FROM orders'
        );


      const revenueRow =
        await get(
          `
          SELECT
            COALESCE(
              SUM(total),
              0
            ) AS s

          FROM orders

          WHERE status!='Cancelled'
          `
        );


      const customersRow =
        await get(
          `
          SELECT COUNT(*) AS c

          FROM users

          WHERE role='customer'
          `
        );


      const productsRow =
        await get(
          `
          SELECT COUNT(*) AS c

          FROM products

          WHERE active=1
          `
        );


      res.json({

        orders:
          Number(
            ordersRow?.c || 0
          ),

        revenue:
          Number(
            revenueRow?.s || 0
          ),

        customers:
          Number(
            customersRow?.c || 0
          ),

        products:
          Number(
            productsRow?.c || 0
          )

      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'Failed to load stats'
        });

    }

  }
);


/* =====================================================
   SPA FALLBACK
===================================================== */

app.use(
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    );

  }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
  (error, req, res, next) => {

    console.error(error);

    if (res.headersSent) {
      return next(error);
    }

    res
      .status(500)
      .json({
        error:
          'Internal server error'
      });

  }
);


/* =====================================================
   START SERVER
===================================================== */

async function startServer() {

  try {

    await initializeDatabase();


    app.listen(
      PORT,
      () => {

        console.log(
          `2M Store running on http://localhost:${PORT}`
        );

        console.log(
          process.env.TURSO_DATABASE_URL
            ? 'Database: Turso'
            : 'Database: Local SQLite'
        );

      }
    );

  } catch (error) {

    console.error(
      'Failed to initialize database:'
    );

    console.error(error);

    process.exit(1);

  }

}


startServer();