# Pathfinder Utilities — Scroll Crafting Calculator (Pathfinder 1e)

Pathfinder Utilities is a **client-side web utility** to calculate the **crafting cost** and **crafting time** for scrolls in **Pathfinder RPG 1e**.

Rules reference (Italian wiki):
- https://golarion.altervista.org/wiki/Pergamene
- https://golarion.altervista.org/wiki/Scrivere_Pergamene

---

## Tech stack

- **HTML + CSS (variables) + JavaScript (vanilla)**
- **ES Modules** (`<script type="module">`)
- No frameworks, no libraries

---

## Local development

**Option A — XAMPP/Apache**

Place the project folder under `htdocs` and open:
```
http://localhost/<folder-name>/
```

**Option B — Python**

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/` in the browser.

---

## Manual verification

1. Open `index.html` in the browser (via local server above).
2. Enter a Caster Level and Spell Level, click **Calcola**.
3. Verify cost and time values update correctly.
4. Toggle language (IT/EN) and theme — values and labels should switch.
5. Add/remove scroll rows and verify totals recalculate.

---

## License

See `LICENSE.txt`.
