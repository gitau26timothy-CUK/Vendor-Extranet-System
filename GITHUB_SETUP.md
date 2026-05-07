# GitHub Repository Setup Guide

Follow these steps to push the Vendor Extranet System to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account
- GitHub CLI (optional but recommended)

## Step 1: Initialize Git Repository

Open your terminal in the project directory and run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Vendor Extranet System for Davis & Shirtliff Hackathon 2026"
```

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Login to GitHub (if not already logged in)
gh auth login

# Create a new repository
gh repo create vendor-extranet-system --public --source=. --remote=origin --push

# Or for private repository
gh repo create vendor-extranet-system --private --source=. --remote=origin --push
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `vendor-extranet-system`
3. Description: `AI-Powered Vendor Extranet System - Davis & Shirtliff Hackathon 2026`
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then connect your local repository:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/vendor-extranet-system.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload

Visit your repository on GitHub:
```
https://github.com/YOUR_USERNAME/vendor-extranet-system
```

You should see all files including:
- README.md
- FEATURES.md
- DEPLOYMENT.md
- backend/ directory
- frontend/ directory
- docker-compose.yml
- All configuration files

## Step 4: Add Repository Topics (Optional)

On GitHub, add relevant topics to make your repository discoverable:

```
vendor-management
extranet
ai-powered
nodejs
react
mongodb
hackathon
davis-shirtliff
procurement
supply-chain
machine-learning
gpt4
analytics
docker
```

## Step 5: Configure Repository Settings

### Branch Protection (Recommended for team projects)

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Include administrators

### Secrets (For CI/CD)

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `SMTP_PASSWORD`

## Step 6: Add Collaborators (If Team Project)

1. Go to Settings → Collaborators
2. Click "Add people"
3. Enter GitHub usernames or emails
4. Choose permission level

## Step 7: Create Project Board (Optional)

1. Go to Projects tab
2. Create new project
3. Add columns: To Do, In Progress, Done
4. Link issues and pull requests

## Useful Git Commands

### Daily Workflow

```bash
# Check status
git status

# Pull latest changes
git pull origin main

# Create new branch for feature
git checkout -b feature/your-feature-name

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature-name

# Switch back to main
git checkout main
```

### Updating Repository

```bash
# Add new files
git add .

# Commit with message
git commit -m "Add new feature: description"

# Push to GitHub
git push origin main
```

### Viewing History

```bash
# View commit history
git log --oneline

# View changes
git diff

# View remote URL
git remote -v
```

## Repository Structure on GitHub

```
vendor-extranet-system/
├── .github/
│   └── workflows/          (CI/CD - to be added)
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .gitattributes
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Dockerfile.backend
├── DEPLOYMENT.md
├── FEATURES.md
├── GITHUB_SETUP.md
├── LICENSE
├── package.json
└── README.md
```

## Recommended GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker-compose build
```

## Troubleshooting

### Large Files Error

If you get an error about large files:

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.pdf"
git lfs track "*.zip"

# Add .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

### Authentication Issues

```bash
# Use personal access token
# Generate at: https://github.com/settings/tokens

# Use token as password when prompted
# Or configure credential helper:
git config --global credential.helper store
```

### Push Rejected

```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

## Best Practices

1. **Commit Often**: Make small, focused commits
2. **Write Clear Messages**: Use descriptive commit messages
3. **Use Branches**: Create feature branches for new work
4. **Pull Regularly**: Keep your local repository up to date
5. **Review Before Push**: Check `git status` and `git diff` before committing
6. **Use .gitignore**: Never commit sensitive data or dependencies
7. **Tag Releases**: Use semantic versioning (v1.0.0, v1.1.0, etc.)

## Creating Releases

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Or create release on GitHub web interface
# Go to Releases → Draft a new release
```

## Repository URL

After setup, your repository will be available at:
```
https://github.com/YOUR_USERNAME/vendor-extranet-system
```

## Clone Command for Others

Share this command with team members:
```bash
git clone https://github.com/YOUR_USERNAME/vendor-extranet-system.git
cd vendor-extranet-system
npm install
cd frontend && npm install
```

## Support

For Git help:
- Git Documentation: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- GitHub CLI: https://cli.github.com/manual/

---

**Ready to push to GitHub!** 🚀