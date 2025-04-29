# 🔒 Qwiet.AI Static Analysis GitHub Action

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/<OWNER>/<REPO>/qwiet-ai-analysis.yml?branch=main)
![Security](https://img.shields.io/badge/security-scanning-blueviolet)
![License](https://img.shields.io/github/license/<OWNER>/<REPO>)

This GitHub Actions workflow integrates [Qwiet.AI](https://www.qwiet.ai/) (formerly ShiftLeft) to perform static application security testing (SAST) on your codebase.

---

## 🚀 Workflow Triggers

This workflow runs automatically on:

- ✅ Push to any branch
- ✅ Pull requests to any branch
- ✅ Manually via the "Run workflow" button in the Actions UI

---

## ⚙️ Manual Inputs (Optional)

When running the workflow manually via GitHub UI, the following inputs can be used:

| Input Name        | Description                                                                 | Required | Default             |
|-------------------|-----------------------------------------------------------------------------|----------|---------------------|
| `scan-path`       | Directory or glob pattern to scan                                           | No       | `.`                 |
| `fail-on-severity`| Minimum severity to fail the build (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)   | No       | `HIGH`              |
| `custom-message`  | Custom message to include in the scan result                               | No       | `Scanning codebase` |

---

## 🔐 Required Secrets

Add the following secret in your repo:

- `SHIFTLEFT_ACCESS_TOKEN`: Your Qwiet.AI access token

Go to **Settings → Secrets and variables → Actions → New repository secret**.

---

## 📄 Example Workflow File

```yaml
name: Qwiet.AI Static Analysis

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - '**'
  workflow_dispatch:
    inputs:
      scan-path:
        description: 'Directory (or glob) to scan'
        required: false
        default: '.'
      fail-on-severity:
        description: 'Minimum severity to fail (e.g., LOW, MEDIUM, HIGH, CRITICAL)'
        required: false
        default: 'HIGH'
      custom-message:
        description: 'Custom message to include in the scan result'
        required: false
        default: 'Scanning codebase'

jobs:
  qwiet-nextgen-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout full codebase
        uses: actions/checkout@v3

      - name: Run Qwiet.AI scan
        run: |
          curl https://cdn.shiftleft.io/download/sl > /usr/local/bin/sl && chmod a+rx /usr/local/bin/sl
          sl analyze --app "${GITHUB_REPOSITORY_OWNER}_${GITHUB_REPOSITORY#*/}" --verbose .
        env:
          SHIFTLEFT_ACCESS_TOKEN: ${{ secrets.SHIFTLEFT_ACCESS_TOKEN }}

## Example Output (GitHub Actions Log)
[INFO] Preparing scan...
[INFO] Analyzing 20 source files...
[INFO] Qwiet.AI analysis complete.

✔ No critical or high severity vulnerabilities found.

Summary:
  LOW:      2
  MEDIUM:   1
  HIGH:     0
  CRITICAL: 0

Custom Message: Scanning codebase