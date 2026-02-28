import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ["react-redact"],
};

const withMDX = createMDX({});
export default withMDX(config);
