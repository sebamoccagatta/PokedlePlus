const postgres = require("postgres");

function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED;

  if (!url) {
    throw new Error("DATABASE_URL is missing (Netlify DB not configured)");
  }

  return url;
}

let cachedSql;

function sql() {
  if (cachedSql) {
    return cachedSql;
  }

  cachedSql = postgres(getDatabaseUrl(), {
    ssl: "require",
  });

  return cachedSql;
}

module.exports = {
  sql,
};
