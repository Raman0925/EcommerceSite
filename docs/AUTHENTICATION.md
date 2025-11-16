# Authentication Documentation

## Overview

This e-commerce application uses **NextAuth.js** as the authentication solution with a **JWT (JSON Web Token) strategy** for managing user sessions. The authentication system uses local email/password credentials stored in a PostgreSQL database via Prisma ORM.

## Table of Contents

1. [Authentication Strategy](#authentication-strategy)
2. [Technology Stack](#technology-stack)
3. [Database Models](#database-models)
4. [Authentication Flow](#authentication-flow)
5. [JWT Token Structure](#jwt-token-structure)
6. [Implementation Steps](#implementation-steps)
7. [Sign In Process](#sign-in-process)
8. [Sign Out Process](#sign-out-process)
9. [User Registration](#user-registration)
10. [Validation](#validation)
11. [Security Considerations](#security-considerations)

---

## Authentication Strategy

We use the **JWT (JSON Web Token) strategy** which provides:

- **Stateless Authentication**: No need to store sessions in the database
- **Scalability**: Works well across multiple servers
- **Performance**: Reduces database queries for session verification
- **Security**: Tokens are encrypted and signed to prevent tampering

### Why JWT Over Session-Based Auth?

| Feature          | JWT Strategy       | Session-Based           |
| ---------------- | ------------------ | ----------------------- |
| Database Queries | Minimal            | High (every request)    |
| Scalability      | Excellent          | Requires shared storage |
| Performance      | Fast               | Slower                  |
| State            | Stateless          | Stateful                |
| Token Storage    | Cookie (encrypted) | Database                |

---

## Technology Stack

- **NextAuth.js v5**: Complete authentication solution for Next.js
- **Prisma ORM**: Database access and models
- **PostgreSQL**: Database for storing user data
- **Zod**: Schema validation for forms
- **bcryptjs**: Password hashing
- **JWT**: Token generation and verification

---

## Database Models

### User Model

The core user model stores essential user information.

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
}
```

**Fields:**

- `id`: Unique identifier (UUID)
- `name`: User's display name (optional)
- `email`: Unique email address (required for login)
- `emailVerified`: Timestamp when email was verified
- `image`: Profile picture URL (optional)
- `password`: Hashed password using bcryptjs
- `role`: User role (default: "user", can be "admin")
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Account Model

Stores OAuth provider information (for future OAuth integration).

```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**Purpose:**

- Supports multiple authentication providers (Google, GitHub, etc.)
- Currently prepared for future OAuth integration
- Links external accounts to internal User records

### Session Model

Tracks active user sessions (primarily for database-backed sessions, but useful for audit trails).

```prisma
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields:**

- `sessionToken`: Unique token identifying the session
- `userId`: Reference to the User
- `expires`: Session expiration timestamp

### VerificationToken Model

Used for email verification and password reset flows.

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Purpose:**

- Email verification links
- Password reset tokens
- Ensures tokens are single-use and time-limited

---

## Authentication Flow

### Complete Authentication Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Authentication Flow                      │
└─────────────────────────────────────────────────────────────────┘

1. USER REGISTRATION
   ┌──────────────┐
   │ User submits │
   │ registration │──────> Validate with Zod Schema
   │ form         │
   └──────────────┘
          │
          ├──> Check if email exists
          │
          ├──> Hash password with bcryptjs
          │
          └──> Create User in database
                      │
                      └──> Redirect to Sign In

2. SIGN IN PROCESS
   ┌──────────────┐
   │ User submits │
   │ email +      │──────> Validate credentials
   │ password     │
   └──────────────┘
          │
          ├──> Query database for user by email
          │
          ├──> Compare password hash
          │
          ├──> If valid: Create JWT token
          │              │
          │              ├─> Encode user info (id, email, role)
          │              │
          │              └─> Sign token with secret
          │
          └──> Store encrypted JWT in session cookie
                      │
                      └──> Redirect to homepage

3. AUTHENTICATED REQUESTS
   ┌──────────────┐
   │ User makes   │
   │ request      │──────> Browser sends cookie
   └──────────────┘
          │
          ├──> NextAuth decrypts JWT
          │
          ├──> Verifies signature and expiration
          │
          ├──> Extracts user info from token
          │
          └──> Creates session object
                      │
                      └──> Available via getServerSession()

4. SIGN OUT
   ┌──────────────┐
   │ User clicks  │
   │ Sign Out     │──────> Clear session cookie
   └──────────────┘
          │
          └──> Redirect to homepage
```

### Detailed Flow Steps

#### Step 1: User Login

```
User enters email and password
        ↓
Form validation (Zod schema)
        ↓
Submit credentials to server
        ↓
Server action: signInWithCredentials()
```

#### Step 2: Credential Verification

```
Receive credentials
        ↓
Query database via Prisma
        ↓
Find user by email
        ↓
Compare password hash (bcryptjs)
        ↓
If valid → Proceed to JWT creation
If invalid → Return error
```

#### Step 3: JWT Token Creation

```
User authenticated successfully
        ↓
NextAuth creates JWT token containing:
  - userId
  - email
  - name
  - role
        ↓
Token is signed with SECRET key
        ↓
Token is encrypted
```

#### Step 4: Session Cookie Storage

```
Encrypted JWT token
        ↓
Stored in HTTP-only cookie
        ↓
Cookie properties:
  - Name: next-auth.session-token
  - HttpOnly: true (prevents XSS)
  - Secure: true (HTTPS only in production)
  - SameSite: lax (CSRF protection)
  - Max-Age: 30 days
```

#### Step 5: Subsequent Requests

```
User makes request
        ↓
Browser automatically sends cookie
        ↓
NextAuth middleware intercepts
        ↓
Decrypt and verify JWT
        ↓
Extract user information
        ↓
Create session object:
  {
    user: {
      id: "uuid",
      email: "user@example.com",
      name: "John Doe",
      role: "user"
    },
    expires: "ISO date string"
  }
        ↓
Session available in components
```

---

## JWT Token Structure

### Token Payload

The JWT token contains the following claims:

```javascript
{
  // Standard JWT claims
  "iat": 1699999999,  // Issued At timestamp
  "exp": 1702591999,  // Expiration timestamp (30 days)
  "jti": "unique-id", // JWT ID

  // NextAuth claims
  "name": "John Doe",
  "email": "john@example.com",
  "picture": null,

  // Custom claims (added in JWT callback)
  "sub": "user-uuid",  // Subject (User ID)
  "role": "user"       // User role
}
```

### Token Lifecycle

- **Creation**: When user signs in successfully
- **Duration**: 30 days (configurable)
- **Renewal**: Automatic on session check (if not expired)
- **Invalidation**: On sign out or expiration

### Security Features

1. **Encryption**: Token is encrypted before storage
2. **Signing**: Token is signed to prevent tampering
3. **Expiration**: Automatic expiry after configured time
4. **HttpOnly Cookie**: Prevents JavaScript access (XSS protection)
5. **Secure Flag**: HTTPS-only transmission in production

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install next-auth@beta bcryptjs zod
npm install -D @types/bcryptjs
```

### Step 2: Update Prisma Schema

Add the authentication models to `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Step 3: Generate and Migrate

```bash
npx prisma generate
npx prisma migrate dev --name add-auth-models
```

### Step 4: Seed User Data

Create or update `prisma/seed.ts` to include sample users:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Create users
  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Doe",
      password: hashedPassword,
      role: "user",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log({ user, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 5: Configure Environment Variables

Add to `.env`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production

# Generate secret with: openssl rand -base64 32
```

### Step 6: Create NextAuth Configuration

Create `src/auth.ts`:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
});
```

### Step 7: Create API Route Handler

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

---

## Sign In Process

### 1. Create Zod Validation Schema

Create `src/lib/validators/auth.ts`:

```typescript
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
```

### 2. Create Server Action

Create `src/lib/actions/auth.actions.ts`:

```typescript
"use server";

import { signIn } from "@/auth";
import { signInSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    const validated = signInSchema.parse({ email, password });

    // Sign in
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }
    throw error;
  }
}
```

### 3. Create Sign In Page and Form

Create `src/app/(auth)/sign-in/page.tsx`:

```typescript
import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <SignInForm />
    </div>
  );
}
```

Create `src/components/auth/sign-in-form.tsx`:

```typescript
"use client";

import { useFormState } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInForm() {
  const [state, formAction] = useFormState(signInWithCredentials, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

---

## Sign Out Process

### 1. Create Server Action

Add to `src/lib/actions/auth.actions.ts`:

```typescript
import { signOut } from "@/auth";

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
```

### 2. Create Sign Out Button Component

Create `src/components/auth/sign-out-button.tsx`:

```typescript
"use client";

import { signOutUser } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <form action={signOutUser}>
      <Button type="submit" variant="ghost">
        Sign Out
      </Button>
    </form>
  );
}
```

### 3. Add to Navigation

Update your navbar to show sign in/out based on session:

```typescript
import { auth } from "@/auth";
import SignOutButton from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav>
      {session ? (
        <div>
          <span>Welcome, {session.user.name}</span>
          <SignOutButton />
        </div>
      ) : (
        <Link href="/sign-in">Sign In</Link>
      )}
    </nav>
  );
}
```

---

## User Registration

### 1. Create Validation Schema

Add to `src/lib/validators/auth.ts`:

```typescript
export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
```

### 2. Create Registration Server Action

Add to `src/lib/actions/auth.actions.ts`:

```typescript
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";
import { signUpSchema } from "@/lib/validators/auth";

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate input
    const validated = signUpSchema.parse({
      name,
      email,
      password,
      confirmPassword,
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
```

### 3. Create Sign Up Page and Form

Create `src/app/(auth)/sign-up/page.tsx`:

```typescript
import SignUpForm from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-3xl font-bold mb-6">Create Account</h1>
      <SignUpForm />
    </div>
  );
}
```

Create `src/components/auth/sign-up-form.tsx`:

```typescript
"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpForm() {
  const [state, formAction] = useFormState(signUp, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/sign-in");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div
          className={`p-3 rounded ${
            state.success
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
```

---

## Validation

### Zod Schema Integration

We use Zod for type-safe validation:

**Benefits:**

- Type inference for TypeScript
- Automatic error messages
- Client and server-side validation
- Easy integration with forms

**Example Schema:**

```typescript
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

**Usage in Server Actions:**

```typescript
export async function signInWithCredentials(formData: FormData) {
  try {
    const validated = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    // Use validated.email and validated.password
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return { error: error.errors[0].message };
    }
  }
}
```

---

## Security Considerations

### Password Security

1. **Hashing**: Passwords are hashed using bcryptjs with salt rounds

   ```typescript
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Never Store Plain Text**: Passwords are never stored in plain text

3. **Secure Comparison**: Use bcrypt.compare() to prevent timing attacks
   ```typescript
   const isValid = await bcrypt.compare(plainPassword, hashedPassword);
   ```

### JWT Security

1. **Secret Key**: Use a strong, random secret key

   ```bash
   openssl rand -base64 32
   ```

2. **Token Expiration**: Tokens expire after 30 days

3. **Encryption**: Tokens are encrypted before storage

4. **HttpOnly Cookies**: Prevents XSS attacks

### CSRF Protection

- `SameSite: lax` cookie attribute
- Next.js CSRF token validation

### Environment Variables

Never commit sensitive data:

```env
# .env.local (gitignored)
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=your-database-url
```

### Production Checklist

- [ ] Use HTTPS in production
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable rate limiting for auth endpoints
- [ ] Implement account lockout after failed attempts
- [ ] Add email verification
- [ ] Enable two-factor authentication (optional)
- [ ] Set up monitoring and logging

---

## Accessing Session Data

### In Server Components

```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### In Server Actions

```typescript
"use server";
import { auth } from "@/auth";

export async function myAction() {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Use session.user.id, session.user.email, etc.
}
```

### In Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function ClientComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### Protecting Routes with Middleware

Create `middleware.ts` in the root:

```typescript
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

---

## Troubleshooting

### Common Issues

**1. "Configuration Error"**

- Check `NEXTAUTH_SECRET` is set in `.env`
- Verify `NEXTAUTH_URL` matches your app URL

**2. "Invalid Credentials"**

- Verify user exists in database
- Check password hash matches
- Ensure email is lowercase

**3. "Session Not Found"**

- Check if JWT strategy is enabled
- Verify cookie is being set
- Check browser cookie settings

**4. "Database Connection Error"**

- Verify `DATABASE_URL` is correct
- Run `npx prisma generate`
- Run migrations: `npx prisma migrate dev`

### Debug Mode

Enable debug logging in `auth.ts`:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true, // Enable in development only
  // ... rest of config
});
```

---

## Next Steps

1. **Email Verification**: Implement email verification flow
2. **Password Reset**: Add forgot password functionality
3. **OAuth Providers**: Add Google/GitHub sign-in
4. **Two-Factor Auth**: Add 2FA for enhanced security
5. **Role-Based Access**: Implement role-based permissions
6. **Session Management**: Add ability to view/revoke active sessions

---

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)
- [JWT.io](https://jwt.io/) - JWT debugger
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Summary

This authentication system provides:

✅ Secure email/password authentication  
✅ JWT-based sessions (stateless and scalable)  
✅ Password hashing with bcryptjs  
✅ Form validation with Zod  
✅ Protected routes and pages  
✅ Sign in/out functionality  
✅ User registration  
✅ Role-based access control  
✅ HttpOnly cookie storage  
✅ CSRF protection

The system is production-ready with proper security measures and follows Next.js and NextAuth.js best practices.
