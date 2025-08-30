# GitHub Repository Push Instructions

This document provides instructions for pushing your code to the GitHub repository.

## Prerequisites

1. Git installed on your machine
2. GitHub account with access to the repository: https://github.com/meetjaka/Hackout_Community-Mangrove-Watch.git

## Instructions

### 1. Initialize Git (if not already done)

```bash
git init
```

### 2. Add your GitHub repository as remote

```bash
git remote add origin https://github.com/meetjaka/Hackout_Community-Mangrove-Watch.git
```

### 3. Pull the latest changes (if any)

```bash
git pull origin main --allow-unrelated-histories
```

### 4. Stage your changes

```bash
git add .
```

### 5. Commit your changes

```bash
git commit -m "Implemented role-specific registration features and fixes"
```

### 6. Push to GitHub

```bash
git push -u origin main
```

## Notes

- If you encounter conflicts during the pull or push operations, you'll need to resolve them manually.
- Make sure sensitive data is not being pushed (check .gitignore and .env.example files).
- You might need to authenticate with GitHub when pushing.
