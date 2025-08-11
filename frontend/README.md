# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
```
Of course. Here is a summarized checklist of the changes you need to make on the frontend and backend every time you want to add a new page that displays new data.

---
### ## Backend (FastAPI) Checklist 🐍

Your goal is to create a new API endpoint that serves the data.

1.  **Define the Data Shape (`schemas/`)**
    * Create a new Python file (e.g., `app/schemas/new_data.py`).
    * Inside, create Pydantic models that define the exact structure of the JSON response you will send to the frontend.

2.  **Create the API Endpoint (`endpoints/`)**
    * Create a new Python file (e.g., `app/api/api_v1/endpoints/new_data.py`).
    * Create an `APIRouter`.
    * Write the endpoint function (e.g., `@router.get("/my-new-data")`) that queries your database (SQL or MongoDB) and returns the data.

3.  **Register the New Endpoint (`api.py`)**
    * Open `app/api/api_v1/api.py`.
    * Import your new router from the endpoints file.
    * Use `api_router.include_router(...)` to add your new endpoint to the main API. This makes it accessible to the outside world.

---
### ## Frontend (React) Checklist ⚛️

Your goal is to create a new page that fetches and displays the data from your new API endpoint.

1.  **Define the Data Types (`types/`)**
    * Open `src/types/index.ts`.
    * Add new TypeScript `interface` definitions that exactly match the Pydantic schemas you created on the backend. This ensures type safety.

2.  **Create the API Service (`services/`)**
    * Create a new file (e.g., `src/services/newDataApi.ts`).
    * Write an `async` function that uses `fetch` to call your new backend endpoint URL (e.g., `http://.../api/v1/new-data/my-new-data`).

3.  **Create the Page Component (`pages/`)**
    * Create a new React component file (e.g., `src/pages/NewDataPage.tsx`).
    * Inside this component, call your new API service function to fetch the data.
    * Handle the loading and error states.
    * Use your reusable components (like `Table` or `StatCard`) to display the data once it has loaded.

4.  **Add Navigation (`App.tsx` & `Navbar.tsx`)**
    * **`App.tsx`**: Add your new page to the list of possible `currentPage` states and add a new condition to render your `NewDataPage` component.
    * **`Navbar.tsx`**: Add a new link or button to the navbar that, when clicked, sets the `currentPage` state to show your new page.

```