# Lukudiplomi - System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser<br/>React + Phaser.js]
        B[Mobile App<br/>React Native + Expo]
    end

    subgraph "API Gateway"
        C[Fastify API Server<br/>Port 3000]
    end

    subgraph "Business Logic"
        D[Authentication<br/>Service]
        E[Game Logic<br/>Service]
        F[Book Management<br/>Service]
        G[Analytics<br/>Service]
    end

    subgraph "Data Layer"
        H[(PostgreSQL<br/>Database)]
        I[(Redis<br/>Cache)]
    end

    subgraph "External Services"
        J[Google OAuth]
        K[Microsoft OAuth]
    end

    A -->|HTTPS/WSS| C
    B -->|HTTPS| C
    C --> D
    C --> E
    C --> F
    C --> G
    D --> H
    D --> J
    D --> K
    E --> H
    E --> I
    F --> H
    F --> I
    G --> H
    G --> I
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend (React)"
        F1[Pages]
        F2[Components]
        F3[Phaser Game Engine]
        F4[State Management<br/>Zustand]
        F5[API Client]
    end

    subgraph "Backend (Node.js)"
        B1[Routes]
        B2[Middleware]
        B3[Services]
        B4[Prisma ORM]
    end

    F1 --> F2
    F1 --> F3
    F1 --> F4
    F2 --> F5
    F4 --> F5
    F5 -->|REST API| B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
```

## Data Flow - Student Logs a Book

```mermaid
sequenceDiagram
    participant S as Student
    participant W as Web/Mobile App
    participant A as API Server
    participant G as Game Logic Service
    participant D as Database
    participant R as Redis Cache

    S->>W: Log book (title, pages, review)
    W->>A: POST /api/students/:id/log-book
    A->>A: Verify JWT token
    A->>D: Get student profile
    D-->>A: Student data
    A->>G: Calculate steps & bonuses
    G->>G: Apply difficulty multiplier
    G->>G: Apply streak bonus
    G->>G: Apply genre diversity
    G-->>A: Total steps calculated
    A->>D: Save reading log
    A->>D: Update game state
    A->>D: Check achievements
    D-->>A: Updated state
    A->>R: Cache new state
    A-->>W: Return updated game state
    W-->>S: Show new position & XP
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as API Server
    participant D as Database
    participant O as OAuth Provider

    alt Email/Password Login
        U->>C: Enter email & password
        C->>A: POST /api/auth/login
        A->>D: Find user by email
        D-->>A: User record
        A->>A: Verify bcrypt hash
        A->>A: Generate JWT token
        A-->>C: Set HTTP-only cookie + return token
        C-->>U: Redirect to dashboard
    else OAuth Login (Google/Microsoft)
        U->>C: Click OAuth button
        C->>O: Redirect to OAuth provider
        O-->>U: Login prompt
        U->>O: Authorize
        O-->>A: Callback with auth code
        A->>O: Exchange code for profile
        O-->>A: User profile data
        A->>D: Find or create user
        D-->>A: User record
        A->>A: Generate JWT token
        A-->>C: Set HTTP-only cookie + return token
        C-->>U: Redirect to dashboard
    end
```

## Database Schema (UML)

```mermaid
erDiagram
    User ||--o{ StudentProfile : has
    User ||--o{ ReadingLog : creates
    User ||--o{ GameState : owns
    User }o--|| School : "belongs to"
    User }o--|| Class : "belongs to"

    StudentProfile ||--o{ Achievement : unlocks

    Class ||--o{ ClassChallenge : has
    Class }o--|| User : "taught by"

    ReadingLog }o--|| Book : references
    ReadingLog ||--o{ GameState : affects

    GameState ||--|| BoardConfig : uses

    User {
        int id PK
        string email UK
        string name
        string passwordHash
        enum role
        datetime createdAt
    }

    StudentProfile {
        int id PK
        int userId FK
        int gradeLevel
        int readingLevel
        int totalPagesRead
        int currentStreak
        int longestStreak
        float totalXP
    }

    ReadingLog {
        int id PK
        int studentId FK
        int bookId FK
        int pagesRead
        string review
        int stepsEarned
        datetime loggedAt
        boolean verified
    }

    GameState {
        int id PK
        int studentId FK
        int currentPosition
        int totalSteps
        int level
        datetime lastUpdated
    }

    Book {
        int id PK
        string title
        string author
        string isbn
        int pageCount
        float difficultyLevel
        string genre
    }

    Achievement {
        int id PK
        string name
        string description
        string icon
        int xpReward
    }
```

## Middleware Pipeline

```mermaid
graph LR
    A[Incoming Request] --> B[CORS]
    B --> C[Helmet<br/>Security Headers]
    C --> D[Rate Limiting]
    D --> E[Cookie Parser]
    E --> F[JWT Verification]
    F --> G{Authenticated?}
    G -->|Yes| H[Route Handler]
    G -->|No| I[401 Unauthorized]
    H --> J[Business Logic]
    J --> K[Response]
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "CDN / Edge"
        A[Vercel/Netlify<br/>Frontend Assets]
    end

    subgraph "Application Tier"
        B[Railway/Render<br/>Node.js API]
        C[Load Balancer]
    end

    subgraph "Data Tier"
        D[(PostgreSQL<br/>Primary)]
        E[(Redis<br/>Cache)]
        F[(PostgreSQL<br/>Replica)]
    end

    subgraph "Mobile Distribution"
        G[Google Play Store]
        H[Apple App Store]
    end

    Users -->|HTTPS| A
    Users -->|HTTPS| C
    MobileUsers --> G
    MobileUsers --> H
    C --> B
    B --> D
    B --> E
    D -.->|Replication| F
    A -->|API Calls| C
```

## Game Logic Flow

```mermaid
flowchart TD
    A[Student Logs Book] --> B{Valid Book?}
    B -->|No| C[Return Error]
    B -->|Yes| D[Get Student Profile]
    D --> E[Base Steps = Pages / 10]
    E --> F[Apply Difficulty Multiplier<br/>0.5x - 2.0x]
    F --> G[Apply Grade Level Bonus<br/>+20% if appropriate]
    G --> H[Apply Streak Bonus<br/>+5% per day, max 50%]
    H --> I[Apply Genre Diversity<br/>+10% per genre, max 50%]
    I --> J[Calculate Total Steps]
    J --> K[Update Position on Board]
    K --> L{Passed Checkpoint?}
    L -->|Yes| M[Award Checkpoint XP]
    L -->|No| N[Continue]
    M --> O{Unlocked Achievement?}
    N --> O
    O -->|Yes| P[Award Achievement]
    O -->|No| Q[Update Leaderboard]
    P --> Q
    Q --> R[Save to Database]
    R --> S[Cache in Redis]
    S --> T[Return to Client]
```

## Technology Stack

```mermaid
mindmap
  root((Lukudiplomi))
    Frontend
      React 18
      Vite
      Phaser.js 3
      Tailwind CSS
      Zustand
    Backend
      Node.js 18+
      Fastify
      Prisma ORM
      JWT
      Bcrypt
    Mobile
      React Native
      Expo
      EAS Build
    Database
      PostgreSQL 14
      Redis 7
    DevOps
      Docker
      Docker Compose
      GitHub Actions
      Railway/Render
    Security
      JWT Tokens
      HTTP-only Cookies
      Rate Limiting
      CORS
      Helmet
```

## Performance Optimization Strategy

```mermaid
graph LR
    A[Request] --> B{Cached?}
    B -->|Yes| C[Return from Redis<br/>&lt;10ms]
    B -->|No| D[Query Database]
    D --> E[Cache Result<br/>TTL: 5 min]
    E --> F[Return to Client<br/>&lt;100ms]

    G[Leaderboard Query] --> H[Redis Sorted Set<br/>O log n]
    I[Student State] --> J[Redis Hash<br/>O 1]
    K[Book Search] --> L[PostgreSQL Index<br/>B-tree]
```

## Scaling Strategy

```mermaid
graph TB
    A[Current: 1000 users] --> B[Next: 10K users]
    B --> C[Next: 100K users]

    A1[Single Server] --> B1[Horizontal Scaling<br/>2-3 API Instances]
    B1 --> C1[Auto-scaling<br/>5-10 API Instances]

    A2[Single DB] --> B2[Read Replicas<br/>Master + 1 Replica]
    B2 --> C2[Sharding<br/>By School ID]

    A3[Redis Single] --> B3[Redis Cluster<br/>3 Nodes]
    B3 --> C3[Redis Cluster<br/>6+ Nodes]
```

## Security Architecture

```mermaid
graph TB
    A[Public Internet] --> B[WAF / CloudFlare]
    B --> C[HTTPS/TLS<br/>Termination]
    C --> D[Rate Limiter<br/>100 req/min]
    D --> E[CORS Filter]
    E --> F[Helmet<br/>Security Headers]
    F --> G[JWT Verification]
    G --> H{Valid Token?}
    H -->|Yes| I[Role-Based Access]
    H -->|No| J[401 Unauthorized]
    I --> K{Has Permission?}
    K -->|Yes| L[Application Logic]
    K -->|No| M[403 Forbidden]
    L --> N[Input Validation]
    N --> O[Sanitize Data]
    O --> P[Parameterized Queries<br/>SQL Injection Prevention]
```

---

## Key Design Decisions

### 1. Server-Authoritative Game Logic
- All game calculations happen on the server
- Prevents cheating and manipulation
- Clients only display results

### 2. Redis Caching Strategy
- Cache frequently accessed data (leaderboards, student states)
- TTL of 5 minutes for most cached data
- Reduces database load by ~70%

### 3. Modular Architecture
- Clear separation: Routes → Middleware → Services → Database
- Easy to test individual components
- Scalable and maintainable

### 4. Multi-Platform Support
- Shared API for web and mobile
- Consistent game logic across platforms
- Phaser.js for engaging web experience

### 5. Progressive Enhancement
- Works on basic browsers
- Enhanced experience with modern features
- Mobile-first responsive design
