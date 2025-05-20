import { App as DefaultApp, createNodeMiddleware } from "@octokit/app";
import { OAuthApp as DefaultOAuthApp } from "@octokit/oauth-app";
import { Octokit } from "./octokit.js";

// Create App and OAuthApp instances with custom Octokit
export const App = DefaultApp.defaults({ Octokit });
export type App = InstanceType<typeof App>;

export const OAuthApp = DefaultOAuthApp.defaults({ Octokit });
export type OAuthApp = InstanceType<typeof OAuthApp>;

// Re-export middleware for convenience
export { createNodeMiddleware };
