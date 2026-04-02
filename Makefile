.PHONY: scaffold-check type-check lint list-packages

# All 31 package directories (used for scaffold validation)
EXTRACT_PKGS := permission-system denial-tracking cost-tracker state-store \
  streaming-tool-executor token-estimation subprocess-env-scrubbing \
  config-migration path-validation read-only-validation analytics-killswitch \
  claudemd-memory yolo-classifier auto-compact sandbox-config \
  dangerous-command-detection
BUILD_PKGS := prompt-system context-injection agent-dialogue-loop \
  skills-system multi-agent-coordinator mcp-integration vim-mode-fsm \
  keyboard-shortcuts ink-renderer cli-startup-optimization
TRANSLATE_TS_PKGS := ivr-call-flow-validator prompt-cache-optimizer
TRANSLATE_PY_PKGS := consecutive-breach-tracker cost-per-interaction \
  agent-skill-routing

ALL_EXTRACT := $(addprefix packages/extract/,$(EXTRACT_PKGS))
ALL_BUILD := $(addprefix packages/build/,$(BUILD_PKGS))
ALL_TRANSLATE_TS := $(addprefix packages/translate/,$(TRANSLATE_TS_PKGS))
ALL_TRANSLATE_PY := $(addprefix packages/translate/,$(TRANSLATE_PY_PKGS))
ALL_PKGS := $(ALL_EXTRACT) $(ALL_BUILD) $(ALL_TRANSLATE_TS) $(ALL_TRANSLATE_PY)
TS_PKGS := $(ALL_EXTRACT) $(ALL_BUILD) $(ALL_TRANSLATE_TS)

scaffold-check:
	@total=0; found=0; \
	for pkg in $(ALL_PKGS); do \
		total=$$((total + 1)); \
		name=$$(basename $$pkg); \
		if [ -d "$$pkg" ] && [ -f "$$pkg/README.md" ]; then \
			found=$$((found + 1)); \
			echo "  OK  $$pkg"; \
		else \
			echo "  MISSING  $$pkg"; \
		fi; \
	done; \
	echo ""; \
	echo "$$found/$$total packages present"; \
	if [ $$found -eq $$total ]; then exit 0; else exit 1; fi

type-check:
	@failed=0; checked=0; \
	for pkg in $(TS_PKGS); do \
		if [ -f "$$pkg/tsconfig.json" ]; then \
			checked=$$((checked + 1)); \
			echo "Checking $$pkg..."; \
			npx tsc --noEmit -p "$$pkg/tsconfig.json" || failed=$$((failed + 1)); \
		fi; \
	done; \
	echo ""; \
	echo "$$checked packages checked, $$failed failed"; \
	if [ $$failed -eq 0 ]; then exit 0; else exit 1; fi

lint:
	@echo "=== TypeScript (Biome) ==="; \
	npx @biomejs/biome check packages/extract packages/build \
		packages/translate/ivr-call-flow-validator \
		packages/translate/prompt-cache-optimizer 2>/dev/null || true; \
	echo ""; \
	echo "=== Python (Ruff) ==="; \
	ruff check packages/translate/consecutive-breach-tracker \
		packages/translate/cost-per-interaction \
		packages/translate/agent-skill-routing 2>/dev/null || true

list-packages:
	@echo "=== Extract Tier (16 TS) ==="; \
	for pkg in $(EXTRACT_PKGS); do echo "  packages/extract/$$pkg"; done; \
	echo ""; \
	echo "=== Build Tier (10 TS) ==="; \
	for pkg in $(BUILD_PKGS); do echo "  packages/build/$$pkg"; done; \
	echo ""; \
	echo "=== Translate Tier (2 TS + 3 Python) ==="; \
	for pkg in $(TRANSLATE_TS_PKGS); do echo "  packages/translate/$$pkg [TS]"; done; \
	for pkg in $(TRANSLATE_PY_PKGS); do echo "  packages/translate/$$pkg [Python]"; done; \
	echo ""; \
	echo "31 packages total (28 TS + 3 Python)"
