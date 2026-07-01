# ARTMJS | Zen Gallery

## 1. Project Philosophy & Stack
A minimalist, high-impact one-pager designed for artists to showcase fragments of work with intentional whitespace and monochromatic scales.

* **Aesthetic**: Zen-like simplicity, monochromatic (Black/White/Grey), and a high focus on "Ma" (negative space).
* **Architecture**: Fully modular and follows the **KISS** (Keep It Simple, Stupid) principle. 
* **Frontend**: Built using **Astro** for performance and **Tailwind CSS** for styling. 
* **Admin Power**: Content and themes are managed via **TinaCMS**, allowing for visual editing of art pieces and site configurations.
* **Modular Blocks**: The site uses dynamic blocks (Hero, Gallery) that the Admin can toggle or reorder.

---

## 2. How to Run Commands
To use these scripts, open the **Terminal** app on your Mac and navigate to your project folder:
`cd ~/Documents/_SITE/_ARTMJS`

Once inside the folder, you can type any of the commands below and press **Enter**.

---

## 3. Available Scripts
| Command | What it does |
| :--- | :--- |
| `npm run dev` | Starts the local website for viewing at `http://localhost:4321`. |
| `npm run admin` | Starts the website **AND** the Admin Dashboard at `http://localhost:4321/admin`. |
| `npm run clean` | The Reset Button: Deletes temp admin files and restarts the dashboard. |
| `npm run tree` | Generates a fresh `site-tree.txt` file to map the project structure. |
| `npm run build` | **Final Step**: Compiles the site into a `dist/` folder for uploading to Hostpoint. |
| `Control + C` | **Stop**: Press this to stop any command currently running in the Terminal. |

---

## 4. Simplified Site Tree
[cite_start]This map shows the essential files you will interact with:

```text
_ARTMJS/
├── tina/
│   └── config.ts             # Admin Dashboard configuration 
├── src/
│   ├── components/
│   │   ├── ArtCard.astro     # Zen Art module [cite: 1, 8]
│   │   └── Hero.astro        # About/Statement module 
│   ├── content/              # Admin-editable data 
│   │   ├── art/              # Individual art JSON files 
│   │   ├── pages/            # Page block configurations 
│   │   └── settings/         # site.json (Theme & Name) 
│   ├── layouts/
│   │   └── Layout.astro      # Global design & colors [cite: 1, 8]
│   └── pages/
│       └── index.astro       # Main One-Pager engine [cite: 1, 4, 8]
├── public/
│   └── uploads/              # Drag-and-drop art images 
├── package.json              # Project dependencies & scripts 
└── tailwind.config.mjs       # Tailwind CSS configuration
```

---

## 5. Project Structure (Verified)
[cite_start]Based on the current project tree:

* [cite_start]**`src/pages/index.astro`**: The main engine that assembles the one-pager. 
* [cite_start]**`src/components/`**: Contains reusable Zen modules like `ArtCard.astro`. 
* [cite_start]**`src/content/art/`**: Stores JSON data for each individual art piece. 
* [cite_start]**`src/content/settings/site.json`**: Global settings for the site name and theme. 
* [cite_start]**`src/content/pages/`**: Reserved for block-based page configurations (e.g., `home.json`). 
* [cite_start]**`public/admin/`**: The location of the Admin Dashboard interface. [cite: 8]

> [cite_start]**Note**: Your `src/components/Hero.md` file  should be renamed to **`Hero.astro`** to function correctly within the Astro framework.

