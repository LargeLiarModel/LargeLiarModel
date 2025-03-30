# LargeLiarModel

## Deployment

This monorepo is configured for deployment on Vercel. The deployment process is as follows:

1. The SvelteKit app in `apps/sk` is built using the `build` script in its package.json
2. The Hono API server in `apps/sk/server` is built and copied to the `.svelte-kit/output/server` directory
3. Vercel deploys the SvelteKit app and the API server together

### Environment Variables

The following environment variables need to be set in Vercel:

- `GEMINI_KEY`: Required by the API for AI functionality
- `DATABASE_URL`: Your Turso database URL
- `DATABASE_AUTH_TOKEN`: Your Turso database authentication token

### Troubleshooting

If you encounter issues with the deployment, check the following:

1. Make sure the Vercel project is configured to use the root directory of the repository
2. Check that all necessary files are committed and pushed to the repository
3. Verify that the environment variables are set correctly in Vercel
