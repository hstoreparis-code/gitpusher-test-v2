# GitPusher.ai — Security CI Cycle (Light)

## Suggested CI steps

1. Install security tools (optional but recommended):

   ```bash
   pip install bandit safety
   cd frontend && npm install --package-lock-only
   ```

2. Run security scan:

   ```bash
   ./scripts/security_scan.sh
   ```

3. Run tests:

   ```bash
   pytest backend/tests
   ```

4. Monitor security log alerts:

   - Check `logs/security.log`
   - Call `/api/admin/security/status`
   - Call `/api/admin/security/logs?limit=50`
