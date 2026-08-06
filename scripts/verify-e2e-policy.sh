#!/usr/bin/env bash
set -euo pipefail

readonly max_event_wait_ms=2000
failed=0

if ! rg -q 'actionTimeout: 2_000,' playwright.config.ts; then
  echo 'playwright.config.ts must set actionTimeout to 2_000 ms.' >&2
  failed=1
fi

if ! rg -q 'navigationTimeout: 2_000,' playwright.config.ts; then
  echo 'playwright.config.ts must set navigationTimeout to 2_000 ms.' >&2
  failed=1
fi

if ! rg -q 'expect: \{ timeout: 2_000,' playwright.config.ts; then
  echo 'playwright.config.ts must set the default assertion timeout to 2_000 ms.' >&2
  failed=1
fi

if arbitrary_waits=$(rg -n --glob '*.ts' 'waitForTimeout\s*\(' tests/e2e); then
  echo 'Arbitrary E2E sleeps are forbidden:' >&2
  echo "$arbitrary_waits" >&2
  failed=1
fi

if timer_waits=$(rg -n -P --glob '*.ts' '(^|[^[:alnum:]_.])setTimeout\s*\(|globalThis\.setTimeout\s*\(' tests/e2e); then
  echo 'Timer-based E2E waits are forbidden:' >&2
  echo "$timer_waits" >&2
  failed=1
fi

if caught_state_probes=$(rg -n --glob '*.ts' '\.is(Enabled|Disabled)\([^;]*\.catch\(' tests/e2e); then
  echo 'Do not catch actionability timeouts to discover optional controls; guard with locator.count() first:' >&2
  echo "$caught_state_probes" >&2
  failed=1
fi

while IFS= read -r timeout_match; do
  [[ -z "$timeout_match" ]] && continue
  raw_value=${timeout_match##*:}
  numeric_value=${raw_value//_/}
  if (( numeric_value > max_event_wait_ms )); then
    echo "E2E event wait exceeds ${max_event_wait_ms} ms: ${timeout_match}" >&2
    failed=1
  fi
done < <(rg -n -o --glob '*.ts' 'timeout\s*:\s*\K[0-9][0-9_]*' tests/e2e -P || true)

timeout_properties=$(rg -n --glob '*.ts' 'timeout\s*:' tests/e2e || true)
if nonliteral_timeouts=$(printf '%s\n' "$timeout_properties" | rg -v 'timeout\s*:\s*[0-9]'); then
  echo 'E2E event waits must use a literal timeout so the 2,000 ms ceiling is auditable:' >&2
  echo "$nonliteral_timeouts" >&2
  failed=1
fi

while IFS= read -r timeout_match; do
  [[ -z "$timeout_match" ]] && continue
  raw_value=${timeout_match##*:}
  numeric_value=${raw_value//_/}
  if (( numeric_value > max_event_wait_ms )); then
    echo "E2E AbortSignal wait exceeds ${max_event_wait_ms} ms: ${timeout_match}" >&2
    failed=1
  fi
done < <(rg -n -o --glob '*.ts' 'AbortSignal\.timeout\(\s*\K[0-9][0-9_]*' tests/e2e -P || true)

abort_timeouts=$(rg -n --glob '*.ts' 'AbortSignal\.timeout\(' tests/e2e || true)
if nonliteral_abort_timeouts=$(printf '%s\n' "$abort_timeouts" | rg -v 'AbortSignal\.timeout\(\s*[0-9]'); then
  echo 'E2E AbortSignal waits must use a literal timeout so the 2,000 ms ceiling is auditable:' >&2
  echo "$nonliteral_abort_timeouts" >&2
  failed=1
fi

exit "$failed"
