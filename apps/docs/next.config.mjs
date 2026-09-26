import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	distDir: process.env.REDACT_BUILD_DIR ?? ".next",
	transpilePackages: ["react-redact"],
};

const withMDX = createMDX({});
export default withMDX(config);
