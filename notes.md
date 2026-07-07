# Project Notes and Reference Guide

This document serves as an educational reference covering the key architecture, libraries, and coding patterns implemented in the GymAI Planner application. It is designed to help beginners and reviewers understand how the parts connect.

---

## 1. Neon Auth

Neon Auth provides user authentication built directly on top of the Neon serverless database.

*   **How it is configured**:
    *   The frontend initializes the authentication client in [auth.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/lib/auth.ts) using the `VITE_NEON_AUTH_URL` environment variable.
    *   In [App.tsx](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/App.tsx), the application is wrapped with `NeonAuthUIProvider`, which injects the authentication context and sets the UI theme.
*   **Accessing the session**:
    *   The client uses `authClient.getSession()` to check if a user is logged in.
    *   If a session exists, the user object (with the unique ID and email) is stored in the application state.

---

## 2. React Context (AuthContext)

React Context is a feature used to share state (like user credentials and the current training plan) globally across components without passing props down manually through multiple levels (known as "prop drilling").

*   **Implementation**:
    *   Located in [AuthContext.tsx](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/context/AuthContext.tsx).
    *   Maintains the state for the current logged-in user (`user`), their generated plan (`plan`), and whether the application is loading (`isLoading`).
    *   Exposes functions like `saveProfile()` and `generatePlan()` which make API calls and trigger a state refresh.
*   **The Custom Hook**:
    *   The context is exposed through a custom `useAuth()` hook.
    *   Any component that needs user or plan data can simply call `const { user, plan } = useAuth();`.

---

## 3. useRef vs. useEffect

Both hooks are fundamental in React, but they serve different purposes. This project demonstrates their differences clearly.

### useEffect
*   **Purpose**: Runs side effects in response to rendering. It synchronizes React state with external systems (like fetching data or subscribing to auth changes).
*   **Behavior**: Triggers every time the values in its dependency array change. If the dependency array is empty `[]`, it runs only once when the component mounts.
*   **Example in project**:
    ```typescript
    useEffect(() => {
      // Runs once when component loads to retrieve user session
      loadUser();
    }, []);
    ```

### useRef
*   **Purpose**: Stores a mutable value that persists across renders, but mutating it does **not** trigger a component re-render.
*   **Behavior**: You read and write to the `.current` property of the ref. It acts as a memory slot for the component that does not affect the UI.
*   **Example in project**:
    *   In [AuthContext.tsx](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/context/AuthContext.tsx), a ref named `isRefreshingRef` is used.
    *   When fetching data begins, `isRefreshingRef.current` is set to `true`.
    *   If another trigger tries to call `refreshData()` while the previous request is pending, it checks `isRefreshingRef.current` and returns early.
    *   This prevents duplicate network requests without triggering unnecessary renders.

---

## 4. API Layer (api.ts)

Separating API calls from the UI components keeps the code clean, modular, and easier to maintain.

*   **Implementation**:
    *   Located in [api.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/lib/api.ts).
    *   Defines helper functions `get()` and `post()` that wrap the browser's native `fetch` API.
    *   Handles common tasks like attaching content-type headers, parsing JSON response bodies, and throwing standardized error messages.
    *   Exposes a clean `api` object containing methods like `saveProfile()`, `generatePlan()`, and `getCurrentPlan()`.
*   **Benefit**: If the backend URL or the fetch library changes, you only need to update it in this one file, rather than modifying every single page component.

---

## 5. Prisma Connection in Backend

Prisma is an Object-Relational Mapper (ORM) that lets developers interact with a database using type-safe TypeScript code instead of writing raw SQL queries.

*   **Database Schema**:
    *   The schema is defined in [schema.prisma](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/server/prisma/schema.prisma). It maps out the tables (`user_profiles`, `training_plans`), data types, and relations.
*   **Neon Serverless Connection**:
    *   In serverless environments (like Neon PostgreSQL), connections can scale up quickly. The project uses `@prisma/adapter-pg` to route connection traffic through Neon's serverless connection pooler.
    *   The Prisma Client is initialized in [prisma.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/server/src/lib/prisma.ts) using the adapter, ensuring efficient query execution.

---

## 6. AI Integration and Structuring Outputs

Integrating an AI model requires robust prompt design and backend processing to ensure the model responds with structured data rather than freeform text.

*   **Setup**:
    *   The server communicates with the OpenAI client configured to point to OpenRouter.
    *   It requests the `google/gemini-2.5-flash-lite` model for speed and efficiency.
*   **Enforcing JSON Structure**:
    *   The system instructions define the persona and request JSON output: `"You are an expert fitness trainer... You must respond with valid JSON only."`
    *   The request specifies `response_format: { type: "json_object" }` to force a JSON response from the API.
    *   The prompt includes an exact JSON template outlining the expected keys (`overview`, `weeklySchedule`, `progression`).
*   **Data Formatting/Parsing**:
    *   The backend parses the response using `JSON.parse()`.
    *   In [ai.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/server/src/lib/ai.ts), the helper function `formatPlanResponse()` validates the output structure and provides default values if any fields are missing or malformed.

---

## 7. TypeScript Types and Data Validation

TypeScript helps detect bugs early by ensuring that variables match their expected structures.

*   **Static Types**:
    *   Defined in [types/index.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/src/types/index.ts).
    *   Defines interfaces like `UserProfile` and `TrainingPlan` so that the client and server agree on the shape of the data.
*   **Data Validation at Boundaries**:
    *   When the server receives an API request, it validates the incoming request body before database insertion.
    *   For example, in [profile.ts](file:///c:/Users/ssaaaadd/Programming/react-gym-ai-planner/server/src/routes/profile.ts), the route checks if `userId` is present and ensures all required fields (goal, experience, split preference, equipment) exist. If anything is missing, it returns a `400 Bad Request` error instead of letting the application crash or pollute the database.
