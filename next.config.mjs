/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_SECRET:'fe1f54bfe790f712bd4e352c79c4dea09f543932fd8f31279c3b84b5a221125f',
        TOKEN : process.env.TOKEN,
        TENANT_ID : process.env.TENANT_ID,
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        SITE_ID: process.env.SITE_ID,
        LIST_ID: process.env.LIST_ID,
        LIST_CLIENTMAPPING_ID: process.env.LIST_CLIENTMAPPING_ID,
    }
};

export default nextConfig;
