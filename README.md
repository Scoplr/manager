# Manager - Team Coordination Platform

A simple platform that helps small to medium-sized teams stay aligned, coordinate work, and manage knowledge.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your database URL.

4.  Push database schema:
    ```bash
    npx drizzle-kit push
    ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Testing

Run unit tests:

```bash
npm test
```
