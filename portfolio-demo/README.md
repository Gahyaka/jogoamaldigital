# JogoAmal Digital — Portfolio Demo

This folder contains a standalone **static frontend portfolio demonstration** based on the JogoAmal Digital project.

## Important limitations

- Uses **sample/simulated transactions** and browser `localStorage` only.
- No authentication, PHP execution, MySQL connection, payment processing, or live donation system.
- The original PHP/MySQL application remains in the repository root and is **not deployed** by this frontend preview.
- Do not enter genuine donor, payment, or sensitive financial data.

## Deploy on Vercel

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
