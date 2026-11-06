# JogoAmal Digital — Portfolio Demo

This folder contains a standalone **static frontend portfolio demonstration** based on the JogoAmal Digital project.

## Important limitations

- **Current live portfolio:** homepage plus original-style Login/Daftar pages only. The dashboard is intentionally unavailable to anonymous visitors and all `/dashboard` routes redirect to `/login.html`. The login/signup fields are disabled because there is no authentication backend.\n- The prior dashboard mockup source remains in GitHub but is excluded from the Vercel production deployment.
- No authentication, PHP execution, MySQL connection, payment processing, or live donation system.
- The original PHP/MySQL application remains in the repository root and is **not deployed** by this frontend preview.
- Do not enter genuine donor, payment, or sensitive financial data.

## Deployment flow (2026-11-06)\n\n- `Lihat Dashboard` on the homepage goes to `/login.html`.\n- Visitors can open Login and Daftar interfaces, but cannot submit credentials or access a dashboard.\n- `vercel.json` redirects direct dashboard requests back to Login.\n- This is **not an authenticated application**. True login, registration, and protected dashboard functionality require a secure backend and database; frontend route redirects by themselves are not authorization.\n\n## Deploy on Vercel

1. Import `Gahyaka/jogoamaldigital` into Vercel as a **new project**.
2. Set **Framework Preset: Other**.
3. Set **Root Directory: `portfolio-demo`** (important; do not deploy the repository root).
4. Leave **Build Command: empty** and **Output Directory: empty/default** for this static HTML site.
5. Deploy and verify the generated `.vercel.app` URL.

For subsequent changes, commits to the connected production branch trigger automatic redeploys. If this preview remains in a PR branch, merge the PR after review and then deploy `main` with the root directory above.

## Security note for the original PHP app

The public repository currently includes database connection credentials in `db_config.php` and executable password-reset scripts (`update_admin_password.php`, `update_user_password.php`) that use hardcoded passwords. **Rotate the database credentials and any affected application passwords; remove the reset scripts from publicly reachable hosting; replace hardcoded configuration with environment variables.** Removing secrets from current files does not remove them from Git history. Avoid publishing a full PHP backend until its authentication, authorization, and CSRF defenses have been reviewed.

## Source

Original code: https://github.com/Gahyaka/jogoamaldigital
