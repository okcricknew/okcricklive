/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://okcrick.in',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  trailingSlash: false,

  // optional cleanup
  exclude: ['/admin', '/login'],
};
