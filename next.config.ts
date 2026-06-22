import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Neo4j driver is a native-ish Node package; keep it out of the bundle so
  // it loads from node_modules at runtime instead of being traced/transpiled.
  serverExternalPackages: ['neo4j-driver'],
};

export default nextConfig;
