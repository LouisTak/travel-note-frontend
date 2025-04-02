# AI Travel Planner Frontend

A modern travel planning application built with Next.js that helps users create personalized travel itineraries, manage travel plans, and get local insights for their next adventure—all powered by artificial intelligence.

![Travel Planner Screenshot](public/screenshot.png)

## Features

- **AI-Powered Itineraries**: Generate personalized day-by-day travel plans based on destination and interests
- **Travel Management**: Create, view, edit, and delete travel plans
- **Itinerary Management**: Add detailed itineraries with checkpoints to your travel plans
- **User Authentication**: Secure login/register system with HTTP-only cookies
- **Responsive Design**: Built with Tailwind CSS for a beautiful experience on all devices
- **Modern UI**: Intuitive interface with loading states, toasts for notifications, and more

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Date Handling**: date-fns and React DatePicker
- **Authentication**: HTTP-only cookies
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see Backend Repository)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/travel-planner-frontend.git
   cd travel-planner-frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL for the backend API | http://localhost:8000/api |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Authentication pages
│   ├── travel/             # Travel plan pages
│   │   ├── [id]/           # Travel plan details
│   │   │   ├── itineraries/  # Itinerary management
│   │   │   └── edit/       # Edit travel plan
│   │   └── create/         # Create new travel plan
├── components/             # Reusable UI components
└── utils/                  # Utility functions and API clients
```

## Scripts

- `yarn dev` - Start the development server
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint
- `yarn rebuild` - Clean cache and rebuild the application

## Authentication Flow

The application uses HTTP-only cookies for authentication:

1. User logs in with email/password
2. Backend sets HTTP-only cookies (access token and refresh token)
3. Cookies are automatically sent with subsequent requests
4. Token refresh is handled automatically when needed

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
