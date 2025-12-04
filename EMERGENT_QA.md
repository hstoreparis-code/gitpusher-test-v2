# GitPusher QA (Low Credit)

To run full QA locally or in CI:

```bash
make qa
```

or from the frontend directory:

```bash
yarn qa
```

This executes:
- API smoke tests (no heavy push)
- Minimal pytest suite (`backend/tests/test_smoke.py`)
- Security header validation on `/status`
- Final **OK / PAS OK** verdict

No external provider calls.
Safe for CI/CD and low-credit execution.
