# ExcelPro Washers Website

This is a Next.js 14+ project with Tailwind CSS, designed for ExcelPro Washers (Ottawa).

## Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

All business information is centralized in `lib/site.ts`. You should edit this file to update:

*   **Business Name & Description**
*   **Contact Information** (Phone, Email, SMS)
*   **Google Form URL** (for quotes)
*   **Services & Pricing**
*   **Social Links**

### Important Placeholders to Update

Open `lib/site.ts` and update the following fields immediately:

*   `business.phone`: Your actual phone number.
*   `business.sms`: Your SMS number.
*   `business.googleFormUrl`: The link to your Google Form for quotes.
*   `business.address`: Your business address.

## Deployment to Vercel

1.  Push this code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and sign up/login.
3.  Click "Add New..." -> "Project".
4.  Import your GitHub repository.
5.  Vercel will automatically detect Next.js. Click "Deploy".

## Project Structure

*   `app/`: Contains the application pages and layout (App Router).
    *   `page.tsx`: Home page.
    *   `services/page.tsx`: Services page.
    *   `contact/page.tsx`: Contact page.
    *   `layout.tsx`: Main layout (includes Navbar and Footer).
    *   `globals.css`: Global styles and Tailwind directives.
*   `components/`: Reusable UI components.
    *   `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, etc.
*   `lib/`: Utility functions and configuration.
    *   `site.ts`: Centralized business config.

## SEO

*   Metadata is configured in `app/layout.tsx` and individual pages.
*   `sitemap.ts` generates `sitemap.xml` automatically.
*   `robots.ts` generates `robots.txt` automatically.
*   `JsonLd.tsx` adds LocalBusiness schema markup.

## Tech Stack

*   [Next.js 14](https://nextjs.org/) (App Router)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React](https://lucide.dev/) (Icons)
*   TypeScript
