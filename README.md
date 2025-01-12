Trade Copier :

I want to build a SaaS App for realtime copying trades between Metatrader accounts. The main structure will be one leader account and its followers. I want to create a subscription system and users should buy at least 2 items (one leader + one follower) to create a copier. users can add items to create another copier or to add followers. There should be a 2 dashboard one for site admins and one for customers and they should be protected by user management system. Admins can manage all and customers can manage only their assets. The customers can only enter their account username, their password and their MT4/MT5 server addresses in order to create leader and followers. We should build the TCP/IP connection to the MT4/MT5 and also keep the communication alive with web sockets in order to copy the users trades real time. 


——————————

# SaaS Trade Copier for MetaTrader

## Overview
This repository contains the codebase for a SaaS application designed to facilitate real-time trade copying between MetaTrader 4 (MT4) and MetaTrader 5 (MT5) accounts. The app enables users to connect their leader accounts with follower accounts to mirror trades seamlessly. It incorporates a subscription-based system and user management features.

## Key Features

### Trade Copying
- Real-time copying of trades between MetaTrader accounts.
- Support for MT4 and MT5 accounts.
- Leader-follower structure with one leader account and multiple follower accounts.

### Subscription System
- Users must purchase at least two items (one leader and one follower) to create a copier.
- Flexible subscription plans to add more copiers or followers as needed.

### Dashboards
1. **Admin Dashboard**:
   - Full control over user management, subscriptions, and trade activity.
   - Monitoring of all leader and follower accounts.
2. **Customer Dashboard**:
   - View and manage owned assets (leader and follower accounts).
   - Add MetaTrader account details (username, password, and server address).

### Real-Time Communication
- Establish and maintain TCP/IP connections to MetaTrader servers.
- Use WebSockets to ensure persistent communication for real-time trade copying.

## Tech Stack
- **Frontend**:
  - Next.js with App Router
  - React, Shadcn UI, Radix UI
  - Tailwind CSS for styling
- **Backend**:
  - Node.js
  - Supabase for authentication and data storage
  - Prisma ORM for database management
- **Networking**:
  - WebSockets for real-time communication
  - TCP/IP connections to MetaTrader servers
- **Package Manager**: Yarn

## Installation and Setup

### Prerequisites
- Node.js (v16 or later)
- Yarn (latest version)
- Supabase project set up
- MetaTrader accounts for testing

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/saas-trade-copier.git
   cd saas-trade-copier
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=your_database_url
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     METATRADER_API_KEY=your_metatrader_api_key
     ```

4. Initialize the database:
   ```bash
   yarn prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   yarn dev
   ```

## Usage

### Admin Dashboard
- Access all users, subscriptions, and trade data.
- Manage MetaTrader accounts and resolve connection issues.

### Customer Dashboard
- Add MetaTrader account credentials (username, password, server).
- Manage leader and follower accounts.
- Monitor copier performance.

## Development Notes
- Use **Prisma** for schema management and migrations.
- Leverage Supabase for authentication and real-time subscriptions.
- Ensure persistent WebSocket connections for trade copying.
- Follow best practices for secure storage of MetaTrader account credentials.

## Contributing
We welcome contributions to this project. Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments
- MetaTrader for their APIs.
- Supabase for providing a powerful backend-as-a-service platform.
- Prisma for simplifying database management.
