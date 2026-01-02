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

function sql() {
  return postgres(getDatabaseUrl(), {
    ssl: "require",
  });
}

module.exports = {
  sql,
};
