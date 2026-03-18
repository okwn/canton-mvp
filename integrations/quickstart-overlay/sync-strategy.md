# Sync Strategy — cn-quickstart

How canton-mvp tracks and adapts to cn-quickstart changes **without** forking or embedding it.

---

## Principles

1. **No code sync**: We do not copy Quickstart code into canton-mvp.
2. **Reference only**: We treat Quickstart as an external dependency (runtime base).
3. **Compatibility tracking**: We document which Quickstart versions work with canton-mvp.
4. **Overlay updates**: When Quickstart changes, we update our overlay (scripts, port map, docs).

---

## What We Track

| Area | How we track | Update trigger |
|------|--------------|---------------|
| Port assignments | `port-map.json` | Quickstart topology change |
| API endpoints | `compatibility-matrix.md` | JSON Ledger API / Validator API changes |
| Splice LocalNet layout | `sync-strategy.md` notes | Splice / Quickstart compose change |
| Daml SDK version | `compatibility-matrix.md` | Quickstart `daml.yaml` / SDK bump |
| Canton version | `compatibility-matrix.md` | Quickstart Canton image/version |

---

## Sync Cadence

| Action | Frequency |
|--------|-----------|
| Review Quickstart releases | On new Quickstart tag/release |
| Update compatibility matrix | When we verify a new version |
| Update port map | When Quickstart changes ports |
| Update scripts | When bootstrap/validation flow changes |

---

## Breaking Change Handling

When Quickstart introduces breaking changes:

1. **Document** in `compatibility-matrix.md` (e.g. "Quickstart X.Y requires canton-mvp Z").
2. **Update** `port-map.json` or scripts if topology/ports change.
3. **Add** adapter or script changes in `integrations/quickstart-overlay/`.
4. **Do not** change core packages; keep them Quickstart-agnostic.

---

## Quickstart Sources

- **Repo**: https://github.com/digital-asset/cn-quickstart
- **LocalNet**: Uses Splice LocalNet from https://github.com/hyperledger-labs/splice (cluster/compose/localnet)
- **Docs**: https://docs.digitalasset.com/build/3.x/quickstart/

---

*Last reviewed: March 2026.*
