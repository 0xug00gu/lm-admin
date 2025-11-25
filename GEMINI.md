# lifemastery-admin

This project is a web-based administration panel for managing challenges, meditations, users, and revenue within the Lifemastery platform. It's built using React with Ant Design for the UI and Refine.dev for the admin framework.

## Project Structure Overview

The project follows a standard React application structure, with a `src` directory containing the main application code.

-   `.gitignore`: Specifies intentionally untracked files to ignore.
-   `db.json`: Likely used for mock API data or local development database.
-   `index.html`: The main HTML file for the single-page application.
-   `package-lock.json`: Records the exact versions of dependencies used.
-   `package.json`: Contains project metadata and script commands.
-   `README.md`: This file, providing project information.
-   `tsconfig.json`, `tsconfig.node.json`: TypeScript configuration files.
-   `vite.config.ts`: Configuration for Vite, the build tool.
-   `node_modules/`: Directory for installed Node.js modules.
-   `src/`: Contains the main application source code.
    -   `App.tsx`: The root component of the React application.
    -   `main.tsx`: Entry point for the React application.
    -   `vite-env.d.ts`: Vite environment type declarations.
    -   `components/`: Reusable UI components.
        -   `common/`: Common UI components.
    -   `pages/`: Contains page-specific components, organized by feature.
        -   `challenges/`: Components for managing challenges (create, edit, list, show).
        -   `classes/`: Components for managing classes (list, show).
        -   `dashboard/`: Dashboard components.
        -   `meditation/`: Components for managing meditations (create, edit, list, show).
        -   `revenue/`: Components for managing revenue (dashboard, manual-add, pg-management, sales-log).
        -   `users/`: Components for managing users (list, show).

## Technologies Used

*   **Frontend Framework:** React
*   **UI Library:** Ant Design
*   **Admin Framework:** Refine.dev
*   **Build Tool:** Vite
*   **Language:** TypeScript

## Building and Running

To install dependencies:

```bash
npm install
```

To start the development server:

```bash
npm run dev
```

To build the project for production:

```bash
npm run build
```

## Development Conventions

*   **Code Style:** The project uses TypeScript and likely follows standard React/TypeScript conventions.
*   **Refine.dev Usage:** Refine.dev's `List`, `EditButton`, `ShowButton`, `DeleteButton`, `useTable`, and `CreateButton` components are used for CRUD operations.
*   **Ant Design Components:** Ant Design components like `Table`, `Input`, `DatePicker`, `Space`, `Button`, `Tag`, `Tabs`, `Descriptions`, `Card`, `Row`, `Col`, `Statistic`, `Badge`, `TimePicker`, `Switch`, `InputNumber`, `Alert`, `List`, `Avatar`, `Divider` are widely used for UI.

## Initial Exploration Notes

-   The `db.json` file suggests that a JSON Server might be used for local API mocking.
-   The `src/pages` directory is well-organized by feature, which helps in locating relevant code.
-   The `ChallengeShow.tsx` component is particularly complex, handling various aspects of a challenge, including settings, Discord integration, authentication status, participant statistics, and message templates.
-   The `meditation` type in challenges is specifically handled, indicating a dedicated feature for meditation.
-   The project has `meditation` specific pages under `src/pages/meditation`. This suggests that the `challenges` page for meditation type is primarily for configuration and overview, while the detailed meditation management might happen in `src/pages/meditation`.
