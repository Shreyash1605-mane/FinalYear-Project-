
name: Update README

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-readme:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Update README
        run: |
          cp docs/README.md README.md

      - name: Commit and push changes
        run: |
          if git diff --quiet README.md; then
            echo "README is already up to date."
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add README.md
          git commit -m "docs: update project README"
          git push
