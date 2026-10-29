# Lights, Camera, Agents! 🎬

A hands-on workshop on building AI agents with [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) and Gemini. It is told as a film production: agents are the cast, tools are the props, and workflows are the crew.

In the lab, you build a **Blog-to-Thread Studio**. It turns a blog URL into an X thread and saves it as a Typefully draft.

```
Reader → Writer → Critic → Director ─(ship)→ Publisher
            ↑                 │
            └──── retake ─────┘   (max 3 takes)
```

## What's inside

| Path | What it is |
| --- | --- |
| `Lights-Camera-Agents.html` | The workshop slide deck (plain HTML/CSS/JS, no build step) |
| `deck.css`, `deck.js`, `assets/` | Styles, navigation, fonts, logos and media used by the deck |
| `lab/Lights-Camera-Agents-Lab.ipynb` | The hands-on Colab lab, with TODOs and collapsible solutions |

## Run the lab

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tezansahu/lights-camera-agents/blob/main/lab/Lights-Camera-Agents-Lab.ipynb)

1. Open the notebook in Colab, then **File → Save a copy in Drive** so your work persists.
2. Add your API keys in Colab's 🔑 **Secrets** panel and switch on **Notebook access** for each one:

   | Secret | Needed? | Get it from |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | ✅ Yes | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier) |
   | `FIRECRAWL_API_KEY` | Optional (falls back to the free Jina reader) | [firecrawl.dev](https://www.firecrawl.dev/) |
   | `TYPEFULLY_API_KEY` | Optional (dry-run without it) | [typefully.com](https://typefully.com) → Settings → API |

3. Run the scenes in order:

   | Scene | What you build |
   | --- | --- |
   | SC 1 | Keys and clapper: load secrets and make a hello-world call |
   | SC 2 | The Reader: your first agent, with a web-scraping tool |
   | SC 3 | The Writer: a brief that outputs JSON |
   | SC 4 | The Critic: a reflection loop, max 3 takes |
   | SC 5 | The Publisher: a Typefully draft tool |
   | SC 6 | Premiere: the whole crew runs as one workflow |
   | SC 7 | Dailies: watch it run in DevUI |
   | SC 8 | Retakes: score it with an LLM judge |

   Every scene has a catch-up cell, so you can rejoin if you fall behind.

## Present the deck

Open `Lights-Camera-Agents.html` in Edge or Chrome. Keep the `assets/` folder next to it.

| Key | Action |
| --- | --- |
| `→` / `Space`, `←` | Next / previous step |
| `F` | Full screen |
| `P` | Presenter window with speaker notes |
| `N` | Notes overlay |
| `B` or `.` | Blackout |

## License

The code and content are released under the [MIT License](LICENSE.txt). Third-party logos and media in `assets/` belong to their respective owners.
